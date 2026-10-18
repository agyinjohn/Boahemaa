"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, deleteUpload, newId, saveUpload, type ApplicationStatus } from "@/lib/db";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { parseYouTubeId } from "@/lib/format";
import { products } from "@/lib/site";

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

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
    document = await saveUpload(fd.get("document"), true);
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
    image = await saveUpload(fd.get("image"));
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
      file = await saveUpload(fd.get("file"));
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
