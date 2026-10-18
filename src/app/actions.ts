"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, getTeamPhotos, newId, setTeamPhoto, type ApplicationStatus } from "@/lib/db";
import { deleteUpload, signUpload, storeUpload, type UploadKind } from "@/lib/storage";
import { checkPassword, endSession, isAdmin, requireAdmin, startSession } from "@/lib/auth";
import { parseYouTubeId } from "@/lib/format";
import { planPrice, team } from "@/lib/site";
import { initializePayment, paystackEnabled } from "@/lib/paystack";
import { normalizePhone, sendSms } from "@/lib/sms";
import { smsAdminNewApplication, smsApplicationReceived, smsStatusChanged } from "@/lib/notify";
import { siteUrl } from "@/lib/url";

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

/* ─────────── Admin: auth ─────────── */

export type FormState = { ok?: boolean; error?: string };

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  if (!checkPassword(text(fd, "password"))) return { error: "Incorrect password." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* ─────────── Admin: news ─────────── */

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
    excerpt: text(fd, "excerpt") || body.slice(0, 160).replace(/\s+\S*$/, "") + "…",
    category: text(fd, "category") || "News",
    image,
    createdAt: new Date().toISOString(),
  });
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

/* ─────────── Admin: team photos ─────────── */

export async function uploadTeamPhoto(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const slug = text(fd, "slug");
  if (!team.some((m) => m.slug === slug)) return { error: "Unknown team member." };
  let url: string | undefined;
  try {
    url = await storeUpload(fd.get("photo"), "image");
  } catch {
    return { error: "Photo must be JPG, PNG, WEBP or GIF." };
  }
  if (!url) return { error: "Please choose a photo." };
  await deleteUpload((await getTeamPhotos())[slug]);
  await setTeamPhoto(slug, url);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeTeamPhoto(fd: FormData) {
  await requireAdmin();
  const slug = text(fd, "slug");
  await deleteUpload((await getTeamPhotos())[slug]);
  await setTeamPhoto(slug, undefined);
  revalidatePath("/", "layout");
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
