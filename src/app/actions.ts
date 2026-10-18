"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CLAIM_STATUSES, db, kv, newId, type ApplicationStatus, type ClaimStatus } from "@/lib/db";
import { deleteUpload, signUpload, storeUpload, type UploadKind } from "@/lib/storage";
import { checkPassword, endSession, isAdmin, requireAdmin, startSession } from "@/lib/auth";
import { parseYouTubeId } from "@/lib/format";
import { CONTACT_TOPICS, claimTypesFor, planPrice } from "@/lib/site";
import { initializePayment, paystackEnabled } from "@/lib/paystack";
import { normalizePhone, sendSms, smsEnabled } from "@/lib/sms";
import { smsAdminNewApplication, smsAdminNewClaim, smsApplicationReceived, smsClaimReceived, smsClaimStatus, smsStatusChanged } from "@/lib/notify";
import { customerData, demoLoginAllowed, endCustomerSession, isActivePolicy, requireCustomer, startCustomerSession } from "@/lib/customer";
import { siteUrl } from "@/lib/url";
import { checkSpam, clientIp, rateLimit, verifyTurnstile } from "@/lib/spam";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

/* ─────────── Uploads ─────────── */

/**
 * Gives the browser a signature to upload one file straight to Cloudinary (returns null when
 * Cloudinary isn't configured, so the file is sent with the form instead). Customers may upload
 * ID documents; everything else is admin-only.
 */
export async function getUploadSignature(kind: UploadKind) {
  if (kind !== "document" && !(await isAdmin())) throw new Error("Not signed in");
  return signUpload(kind);
}

/* ─────────── Public: insurance application ─────────── */

export type ApplyState = { ok?: boolean; reference?: string; name?: string; amount?: number; error?: string };

// Reference numbers like SB-2026-7KQ4XM: hard to guess, since they open the payment page.
const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newReference = () =>
  `SB-${new Date().getFullYear()}-${Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => REF_CHARS[b % REF_CHARS.length]).join("")}`;

export async function submitApplication(_: ApplyState, fd: FormData): Promise<ApplyState> {
  const spam = await checkSpam(fd, "apply");
  if (!spam.ok) {
    // For bots, act as if it worked (nothing is saved and no SMS is sent).
    return spam.silent ? { ok: true, reference: newReference(), name: "there", amount: 0 } : { error: spam.error };
  }
  const fields = {
    fullName: text(fd, "fullName"),
    email: text(fd, "email"),
    phone: text(fd, "phone"),
    dateOfBirth: text(fd, "dateOfBirth"),
    region: text(fd, "region"),
    occupation: text(fd, "occupation"),
    product: text(fd, "product"),
    plan: text(fd, "plan"),
    message: text(fd, "message"),
  };
  const required = ["fullName", "phone", "dateOfBirth", "region", "product", "plan"] as const;
  if (required.some((k) => !fields[k])) return { error: "Please fill in all required fields." };
  // The price is looked up on the server, never taken from the form.
  const amount = planPrice(fields.product, fields.plan);
  if (!amount) return { error: "Please choose a valid insurance plan." };
  if (normalizePhone(fields.phone).length < 10) return { error: "Please enter a valid phone number." };
  if (fd.get("consent") !== "on") return { error: "Please accept the declaration to continue." };

  let document: string | undefined;
  try {
    document = await storeUpload(fd.get("document"), "document");
  } catch {
    return { error: "ID document must be an image or PDF." };
  }

  const reference = newReference();
  const application = await db.insert("applications", {
    id: newId(),
    reference,
    ...fields,
    document,
    status: "Pending",
    amount,
    createdAt: new Date().toISOString(),
  });
  await Promise.all([
    smsApplicationReceived(application, `${await siteUrl()}/pay/${reference}`),
    smsAdminNewApplication(application),
  ]);
  revalidatePath("/admin", "layout");
  return { ok: true, reference, amount, name: fields.fullName.split(" ")[0] };
}

/* ─────────── Public: premium payment ─────────── */

/** Sends the customer to Paystack to pay the first premium for an application. */
export async function startPayment(_: FormState, fd: FormData): Promise<FormState> {
  const app = await db.findApplication(text(fd, "reference"));
  if (!app) return { error: "We couldn't find that application." };
  if (app.payment) redirect(`/pay/${app.reference}`);
  if (!paystackEnabled) return { error: "Online payment isn't set up yet. Please pay at any SUSU BOX branch." };

  let checkoutUrl: string;
  try {
    checkoutUrl = await initializePayment({
      // Paystack needs an email; customers without one get a placeholder address.
      email: app.email || `customer.${normalizePhone(app.phone)}@${process.env.PAYMENT_EMAIL_DOMAIN || "example.com"}`,
      amount: app.amount,
      reference: `${app.reference}-${Date.now().toString(36).toUpperCase()}`,
      callbackUrl: `${await siteUrl()}/pay/callback`,
      metadata: { applicationId: app.id, applicationReference: app.reference, customer: app.fullName },
    });
  } catch (err) {
    console.error("Paystack initialize failed", err);
    return { error: "Couldn't connect to Paystack. Please try again." };
  }
  redirect(checkoutUrl);
}

/* ─────────── Public: contact form ─────────── */

export async function sendMessage(_: FormState, fd: FormData): Promise<FormState> {
  const spam = await checkSpam(fd, "contact");
  if (!spam.ok) return spam.silent ? { ok: true } : { error: spam.error };

  const msg = {
    name: text(fd, "name").slice(0, 100),
    phone: text(fd, "phone").slice(0, 20),
    email: text(fd, "email").slice(0, 120),
    topic: CONTACT_TOPICS.includes(text(fd, "topic")) ? text(fd, "topic") : CONTACT_TOPICS[0],
    message: text(fd, "message").slice(0, 2000),
  };
  if (!msg.name || !msg.message) return { error: "Please enter your name and a message." };
  if (!msg.phone && !msg.email) return { error: "Please give a phone number or email so we can reply." };
  if (msg.phone && normalizePhone(msg.phone).length < 10) return { error: "Please enter a valid phone number." };

  await db.insert("messages", { id: newId(), ...msg, read: false, createdAt: new Date().toISOString() });
  const staff = process.env.ADMIN_SMS_PHONE;
  if (staff) await sendSms(staff, `New ${msg.topic.toLowerCase()} message from ${msg.name} (${msg.phone || msg.email}). See the admin dashboard.`);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/* ─────────── Customer accounts: sign in with an SMS code ─────────── */

export type LoginState = { step?: "code"; phone?: string; demoCode?: string; error?: string };

const CODE_TTL = 10 * 60;
const hashCode = (phone: string, code: string) =>
  crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(`${process.env.SESSION_SECRET || "susubox-dev-secret"}:${phone}:${code}`))
    .then((buf) => Buffer.from(buf).toString("hex"));

export async function requestLoginCode(_: LoginState, fd: FormData): Promise<LoginState> {
  const phone = normalizePhone(text(fd, "phone"));
  if (!/^0\d{9}$/.test(phone)) return { error: "Please enter a valid Ghana phone number, e.g. 024 123 4567." };

  const spam = await checkSpam(fd, "login-code", 10, 3600);
  if (!spam.ok) return spam.silent ? { step: "code", phone } : { error: spam.error };
  if (!(await rateLimit(`login-code-phone:${phone}`, 3, 15 * 60))) {
    return { error: "Too many codes sent to this number. Please wait 15 minutes." };
  }

  const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
  await kv.set(`login:${phone}`, { hash: await hashCode(phone, code), attempts: 0 }, CODE_TTL);
  await sendSms(phone, `Your SUSU BOX sign-in code is ${code}. It expires in 10 minutes. Never share this code.`);
  // Without SMS (local demo, or ALLOW_DEMO_LOGIN on a live site) the code is shown on screen instead.
  return { step: "code", phone, demoCode: !smsEnabled && demoLoginAllowed() ? code : undefined };
}

export async function verifyLoginCode(_: LoginState, fd: FormData): Promise<LoginState> {
  const phone = normalizePhone(text(fd, "phone"));
  const code = text(fd, "code").replace(/\D/g, "");
  const back = { step: "code" as const, phone };
  const saved = await kv.get<{ hash: string; attempts: number }>(`login:${phone}`);
  if (!saved) return { ...back, error: "This code has expired. Please request a new one." };
  if (saved.attempts >= 5) {
    await kv.del(`login:${phone}`);
    return { ...back, error: "Too many wrong codes. Please request a new one." };
  }
  if ((await hashCode(phone, code)) !== saved.hash) {
    await kv.set(`login:${phone}`, { ...saved, attempts: saved.attempts + 1 }, CODE_TTL);
    return { ...back, error: "That code isn't right. Please check the SMS and try again." };
  }
  await kv.del(`login:${phone}`);
  await startCustomerSession(phone);
  redirect("/account");
}

export async function customerLogout() {
  await endCustomerSession();
  redirect("/account/login");
}

/* ─────────── Customer accounts: claims ─────────── */

const CLAIM_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const newClaimReference = () =>
  `CL-${new Date().getFullYear()}-${Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => CLAIM_CHARS[b % CLAIM_CHARS.length]).join("")}`;

export async function submitClaim(_: FormState, fd: FormData): Promise<FormState> {
  const phone = await requireCustomer();
  const { applications, name } = await customerData(phone);
  const policy = applications.find((a) => a.id === text(fd, "applicationId"));
  if (!policy || !isActivePolicy(policy)) return { error: "Please choose one of your active policies." };

  const type = text(fd, "type");
  if (!claimTypesFor(policy.product).includes(type)) return { error: "Please choose what happened." };
  const incidentDate = text(fd, "incidentDate");
  const day = new Date(incidentDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(incidentDate) || isNaN(day.getTime()) || day.getTime() > Date.now()) {
    return { error: "Please enter the date it happened (not in the future)." };
  }
  const description = text(fd, "description").slice(0, 2000);
  if (description.length < 20) return { error: "Please describe what happened in a few sentences." };
  const amountText = text(fd, "amountClaimed").replace(/[^\d.]/g, "");
  const amountClaimed = amountText ? Math.round(Number(amountText) * 100) / 100 : undefined;
  if (amountClaimed !== undefined && !(amountClaimed > 0)) return { error: "Please enter a valid amount, or leave it empty." };
  if (!(await rateLimit(`claim:${phone}`, 5, 24 * 3600))) return { error: "You've submitted several claims today. Please call us to add another." };

  const documents: string[] = [];
  try {
    for (const file of fd.getAll("documents").slice(0, 5)) {
      const stored = await storeUpload(file, "document");
      if (stored) documents.push(stored);
    }
  } catch {
    await Promise.all(documents.map((d) => deleteUpload(d)));
    return { error: "Documents must be photos (JPG, PNG, WEBP) or PDFs." };
  }

  const now = new Date().toISOString();
  const claim = await db.insert("claims", {
    id: newId(),
    reference: newClaimReference(),
    phone,
    customerName: name ?? policy.fullName,
    applicationId: policy.id,
    policyReference: policy.reference,
    product: policy.product,
    plan: policy.plan,
    type,
    incidentDate,
    description,
    amountClaimed,
    documents,
    status: "Submitted",
    history: [{ status: "Submitted", at: now }],
    createdAt: now,
  });
  await Promise.all([smsClaimReceived(claim, `${await siteUrl()}/account/claims/${claim.id}`), smsAdminNewClaim(claim)]);
  revalidatePath("/admin", "layout");
  revalidatePath("/account", "layout");
  redirect(`/account/claims/${claim.id}?new=1`);
}

/* ─────────── Admin: auth ─────────── */

export type FormState = { ok?: boolean; error?: string };

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  // Slow down password guessing: 10 attempts per 15 minutes per IP address.
  if (!(await rateLimit(`login:${await clientIp()}`, 10, 15 * 60))) {
    return { error: "Too many sign-in attempts. Please wait 15 minutes and try again." };
  }
  const captchaError = await verifyTurnstile(fd);
  if (captchaError) return { error: captchaError };
  if (!checkPassword(text(fd, "password"))) return { error: "Incorrect password." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* ─────────── Admin: news ─────────── */

const NEWS_CATEGORIES = ["News", "Community", "Announcement", "Guide", "Event"];

/** The summary shown on news cards: what the admin typed, or the start of the story. */
function excerptFor(fd: FormData, body: string) {
  const typed = text(fd, "excerpt");
  if (typed) return typed;
  return body.length <= 160 ? body : body.slice(0, 160).replace(/\s+\S*$/, "") + "…";
}

export async function createNews(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const title = text(fd, "title");
  const body = text(fd, "body");
  if (!title || !body) return { error: "Title and story are required." };
  let image: string | undefined;
  try {
    image = await storeUpload(fd.get("image"), "image");
  } catch {
    return { error: "Cover image must be JPG, PNG, WEBP or GIF." };
  }
  await db.insert("news", {
    id: newId(),
    title,
    body,
    excerpt: excerptFor(fd, body),
    category: NEWS_CATEGORIES.includes(text(fd, "category")) ? text(fd, "category") : "News",
    image,
    createdAt: new Date().toISOString(),
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateNews(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const item = await db.get("news", text(fd, "id"));
  if (!item) return { error: "This story no longer exists." };
  const title = text(fd, "title");
  const body = text(fd, "body");
  if (!title || !body) return { error: "Title and story are required." };

  let image = item.image;
  try {
    const uploaded = await storeUpload(fd.get("image"), "image");
    if (uploaded) image = uploaded;
    else if (fd.get("removeImage") === "on") image = undefined;
  } catch {
    return { error: "Cover image must be JPG, PNG, WEBP or GIF." };
  }

  await db.update("news", item.id, {
    title,
    body,
    excerpt: excerptFor(fd, body),
    category: NEWS_CATEGORIES.includes(text(fd, "category")) ? text(fd, "category") : item.category,
    image,
  });
  if (image !== item.image) await deleteUpload(item.image);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteNews(fd: FormData) {
  await requireAdmin();
  const removed = await db.remove("news", text(fd, "id"));
  await deleteUpload(removed?.image);
  revalidatePath("/", "layout");
}

/* ─────────── Admin: videos ─────────── */

export async function createVideo(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const title = text(fd, "title");
  if (!title) return { error: "A title is required." };
  const link = text(fd, "youtube");
  const youtubeId = link ? parseYouTubeId(link) : undefined;
  if (link && !youtubeId) return { error: "That doesn't look like a valid YouTube link." };

  let file: string | undefined;
  if (!youtubeId) {
    try {
      file = await storeUpload(fd.get("file"), "video");
    } catch {
      return { error: "Video must be MP4, WEBM or MOV." };
    }
    if (!file) return { error: "Paste a YouTube link or upload a video file." };
  }
  await db.insert("videos", {
    id: newId(),
    title,
    description: text(fd, "description"),
    youtubeId,
    file,
    createdAt: new Date().toISOString(),
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteVideo(fd: FormData) {
  await requireAdmin();
  const removed = await db.remove("videos", text(fd, "id"));
  await deleteUpload(removed?.file);
  revalidatePath("/", "layout");
}

/* ─────────── Admin: applications ─────────── */

const STATUSES: ApplicationStatus[] = ["Pending", "Under Review", "Approved", "Rejected"];

export async function setApplicationStatus(fd: FormData) {
  await requireAdmin();
  const status = text(fd, "status") as ApplicationStatus;
  if (!STATUSES.includes(status)) return;
  const app = await db.get("applications", text(fd, "id"));
  if (!app || app.status === status) return;
  await db.update("applications", app.id, { status });
  await smsStatusChanged({ ...app, status });
  revalidatePath("/admin", "layout");
}

export async function deleteApplication(fd: FormData) {
  await requireAdmin();
  const removed = await db.remove("applications", text(fd, "id"));
  await deleteUpload(removed?.document);
  revalidatePath("/admin", "layout");
}

/* ─────────── Admin: team & projects ─────────── */

/** Uploads/keeps/removes the photo field of a team or project form. Returns the new URL, or an error. */
async function photoField(fd: FormData, field: string, current: string | undefined) {
  const uploaded = await storeUpload(fd.get(field), "image");
  if (uploaded) return uploaded;
  return fd.get("removeImage") === "on" ? undefined : current;
}

function afterTeamOrProjectChange() {
  revalidatePath("/", "layout");
}

export async function saveTeamMember(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const fields = {
    name: text(fd, "name").slice(0, 80),
    role: text(fd, "role").slice(0, 80),
    dept: text(fd, "dept").slice(0, 40) || "Operations",
    bio: text(fd, "bio").slice(0, 200),
  };
  if (!fields.name || !fields.role) return { error: "Name and role are required." };

  const existing = text(fd, "id") ? await db.get("team", text(fd, "id")) : undefined;
  if (text(fd, "id") && !existing) return { error: "This person no longer exists." };
  let photo: string | undefined;
  try {
    photo = await photoField(fd, "photo", existing?.photo);
  } catch {
    return { error: "Photo must be JPG, PNG, WEBP or GIF." };
  }

  if (existing) {
    await db.update("team", existing.id, { ...fields, photo });
    if (photo !== existing.photo) await deleteUpload(existing.photo);
  } else {
    await db.insert("team", { id: newId(), ...fields, photo, order: await db.nextOrder("team"), createdAt: new Date().toISOString() });
  }
  afterTeamOrProjectChange();
  if (!existing) redirect("/admin/team");
  return { ok: true };
}

export async function deleteTeamMember(fd: FormData) {
  await requireAdmin();
  const removed = await db.remove("team", text(fd, "id"));
  await deleteUpload(removed?.photo);
  afterTeamOrProjectChange();
}

export async function saveProject(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const fields = {
    title: text(fd, "title").slice(0, 100),
    place: text(fd, "place").slice(0, 60),
    year: text(fd, "year"),
    tag: text(fd, "tag").slice(0, 30) || "Community",
    text: text(fd, "text").slice(0, 400),
  };
  if (!fields.title || !fields.text) return { error: "Title and description are required." };
  if (!/^(19|20)\d{2}$/.test(fields.year)) return { error: "Please enter a year like 2024." };

  const existing = text(fd, "id") ? await db.get("projects", text(fd, "id")) : undefined;
  if (text(fd, "id") && !existing) return { error: "This project no longer exists." };
  let image: string | undefined;
  try {
    image = await photoField(fd, "image", existing?.image);
  } catch {
    return { error: "Image must be JPG, PNG, WEBP or GIF." };
  }

  if (existing) {
    await db.update("projects", existing.id, { ...fields, image });
    if (image !== existing.image) await deleteUpload(existing.image);
  } else {
    await db.insert("projects", { id: newId(), ...fields, image, order: await db.nextOrder("projects"), createdAt: new Date().toISOString() });
  }
  afterTeamOrProjectChange();
  if (!existing) redirect("/admin/projects");
  return { ok: true };
}

export async function deleteProject(fd: FormData) {
  await requireAdmin();
  const removed = await db.remove("projects", text(fd, "id"));
  await deleteUpload(removed?.image);
  afterTeamOrProjectChange();
}

/** Moves a team member or project up or down the list. */
export async function moveItem(fd: FormData) {
  await requireAdmin();
  const kind = text(fd, "kind") === "projects" ? "projects" : "team";
  await db.move(kind, text(fd, "id"), text(fd, "direction") === "up" ? -1 : 1);
  afterTeamOrProjectChange();
}

/* ─────────── Admin: SMS ─────────── */

export async function resendPaymentLink(fd: FormData) {
  await requireAdmin();
  const app = await db.get("applications", text(fd, "id"));
  if (!app || app.payment) return;
  await smsApplicationReceived(app, `${await siteUrl()}/pay/${app.reference}`);
  revalidatePath("/admin", "layout");
}

export async function sendTestSms(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const phone = text(fd, "phone");
  const message = text(fd, "message") || "Test message from the SUSU BOX website.";
  if (normalizePhone(phone).length < 10) return { error: "Enter a valid phone number." };
  const status = await sendSms(phone, message);
  revalidatePath("/admin/sms");
  return status === "failed" ? { error: "mNotify rejected the message. See the log below for details." } : { ok: true };
}

/* ─────────── Admin: contact messages ─────────── */

export async function toggleMessageRead(fd: FormData) {
  await requireAdmin();
  await db.update("messages", text(fd, "id"), { read: text(fd, "read") === "true" });
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(fd: FormData) {
  await requireAdmin();
  await db.remove("messages", text(fd, "id"));
  revalidatePath("/admin", "layout");
}

/* ─────────── Admin: claims ─────────── */

export async function updateClaim(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const claim = await db.get("claims", text(fd, "id"));
  if (!claim) return { error: "This claim no longer exists." };
  const status = text(fd, "status") as ClaimStatus;
  if (!CLAIM_STATUSES.includes(status)) return { error: "Choose a status." };
  const note = text(fd, "note").slice(0, 500) || undefined;
  const approvedText = text(fd, "approvedAmount").replace(/[^\d.]/g, "");
  const approvedAmount = approvedText ? Math.round(Number(approvedText) * 100) / 100 : claim.approvedAmount;
  if ((status === "Approved" || status === "Paid") && !(approvedAmount && approvedAmount > 0)) {
    return { error: "Enter the approved amount before approving or paying a claim." };
  }
  if (status === claim.status && !note && approvedAmount === claim.approvedAmount) return { error: "Nothing has changed." };

  const updated = {
    ...claim,
    status,
    approvedAmount,
    history: [...claim.history, { status, note, at: new Date().toISOString() }],
  };
  await db.update("claims", claim.id, { status, approvedAmount, history: updated.history });
  if (status !== claim.status || note) await smsClaimStatus(updated, note);
  revalidatePath("/admin", "layout");
  revalidatePath("/account", "layout");
  return { ok: true };
}
