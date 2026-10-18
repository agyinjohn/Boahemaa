"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, getTeamPhotos, newId, setTeamPhoto, type ApplicationStatus } from "@/lib/db";
import { deleteUpload, signUpload, storeUpload, type UploadKind } from "@/lib/storage";
import { checkPassword, endSession, isAdmin, requireAdmin, startSession } from "@/lib/auth";
import { parseYouTubeId } from "@/lib/format";
import { products, team } from "@/lib/site";

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

export type ApplyState = { ok?: boolean; reference?: string; name?: string; error?: string };

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
  if (!products.some((p) => p.name === fields.product)) return { error: "Please choose a valid insurance product." };
  if (fd.get("consent") !== "on") return { error: "Please accept the declaration to continue." };

  let document: string | undefined;
  try {
    document = await storeUpload(fd.get("document"), "document");
  } catch {
    return { error: "ID document must be an image or PDF." };
  }

  const reference = `SB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  await db.insert("applications", {
    id: newId(),
    reference,
    ...fields,
    document,
    status: "Pending",
    createdAt: new Date().toISOString(),
  });
  revalidatePath("/admin");
  return { ok: true, reference, name: fields.fullName.split(" ")[0] };
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
  await db.update("applications", text(fd, "id"), { status });
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
