import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { readOnlyHost, StorageNotConfiguredError } from "@/lib/store";

/*
 * File storage for uploads (news images, videos, team photos, customer ID documents).
 *
 * - With CLOUDINARY_* env vars set (e.g. on Vercel), browsers upload straight to Cloudinary using a
 *   signature from the server, and we store the resulting URL.
 * - Without them, files are saved to data/uploads on the local disk (handy for `npm run dev`).
 *
 * Stored values:
 *   public files  → a URL ("https://res.cloudinary.com/..." or "/uploads/<name>")
 *   ID documents  → a private reference ("cld:<resource>:<public_id>:<format>" or "local:<name>"),
 *                   opened through /admin/documents/<ref>, which checks the admin login.
 */

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
export const usingCloudinary = Boolean(cloudName && apiKey && apiSecret);
if (usingCloudinary) cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
export const PRIVATE_DIR = path.join(UPLOAD_DIR, "private");

export type UploadKind = "image" | "video" | "document";

const FORMATS: Record<UploadKind, string> = {
  image: "jpg,jpeg,png,webp,gif",
  video: "mp4,webm,mov",
  document: "jpg,jpeg,png,webp,pdf",
};
const LOCAL_EXT: Record<UploadKind, RegExp> = {
  image: /^\.(jpe?g|png|webp|gif)$/,
  video: /^\.(mp4|webm|mov)$/,
  document: /^\.(jpe?g|png|webp|pdf)$/,
};

export type UploadSignature = { url: string; fields: Record<string, string> };

/** Signed parameters that let the browser upload one file directly to Cloudinary. */
export function signUpload(kind: UploadKind): UploadSignature | null {
  if (!usingCloudinary) return null;
  const params: Record<string, string> = {
    allowed_formats: FORMATS[kind],
    folder: kind === "document" ? "susubox/private" : `susubox/${kind}s`,
    timestamp: String(Math.round(Date.now() / 1000)),
  };
  // ID documents are "authenticated": they can't be opened without a signed link.
  if (kind === "document") params.type = "authenticated";
  const signature = cloudinary.utils.api_sign_request(params, apiSecret!);
  const resource = kind === "video" ? "video" : "image";
  return {
    url: `https://api.cloudinary.com/v1_1/${cloudName}/${resource}/upload`,
    fields: { ...params, api_key: apiKey!, signature },
  };
}

type CloudinaryResult = {
  public_id: string;
  version: number;
  signature: string;
  secure_url: string;
  resource_type: string;
  format: string;
};

/** Checks that an upload result really came from our Cloudinary account. */
function verifyResult(r: CloudinaryResult) {
  const expected = crypto
    .createHash("sha1")
    .update(`public_id=${r.public_id}&version=${r.version}${apiSecret}`)
    .digest("hex");
  return typeof r.signature === "string" && r.signature === expected;
}

/**
 * Turns a form field into a stored value. The field holds either the JSON result of a direct
 * Cloudinary upload, or (in local mode) the file itself. Returns undefined when nothing was sent.
 */
export async function storeUpload(value: FormDataEntryValue | null, kind: UploadKind): Promise<string | undefined> {
  if (typeof value === "string" && value) {
    if (!usingCloudinary) throw new Error("Cloudinary is not configured");
    const result = JSON.parse(value) as CloudinaryResult;
    if (!verifyResult(result)) throw new Error("Invalid upload");
    const resource = result.resource_type;
    if (kind === "video" ? resource !== "video" : resource !== "image") throw new Error("Wrong file type");
    return kind === "document" ? `cld:${resource}:${result.public_id}:${result.format}` : result.secure_url;
  }

  if (!(value instanceof File) || value.size === 0) return undefined;
  if (usingCloudinary) throw new Error("Upload the file to Cloudinary first");
  if (readOnlyHost) {
    throw new StorageNotConfiguredError("File uploads need Cloudinary on this host: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, then redeploy.");
  }
  const ext = path.extname(value.name).toLowerCase();
  if (!LOCAL_EXT[kind].test(ext)) throw new Error("Unsupported file type");
  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  const dir = kind === "document" ? PRIVATE_DIR : UPLOAD_DIR;
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await value.arrayBuffer()));
  return kind === "document" ? `local:${name}` : `/uploads/${name}`;
}

/** Deletes a stored file. Never throws: a missing file shouldn't block deleting the record. */
export async function deleteUpload(stored?: string) {
  if (!stored) return;
  try {
    if (stored.startsWith("/uploads/")) {
      await fs.rm(path.join(UPLOAD_DIR, path.basename(stored)), { force: true });
    } else if (stored.startsWith("local:")) {
      await fs.rm(path.join(PRIVATE_DIR, path.basename(stored.slice(6))), { force: true });
    } else if (usingCloudinary && stored.startsWith("cld:")) {
      const [, resource, publicId] = stored.split(":");
      await cloudinary.uploader.destroy(publicId, { resource_type: resource, type: "authenticated", invalidate: true });
    } else if (usingCloudinary) {
      const m = stored.match(/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
      if (m) await cloudinary.uploader.destroy(m[2], { resource_type: m[1], invalidate: true });
    }
  } catch (err) {
    console.error("Could not delete upload", stored, err);
  }
}

/** A link to a private ID document that only works for the next 10 minutes. */
export function privateDocumentUrl(ref: string): string | null {
  if (!usingCloudinary || !ref.startsWith("cld:")) return null;
  const [, resource, publicId, format] = ref.split(":");
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: resource as "image",
    type: "authenticated",
    expires_at: Math.round(Date.now() / 1000) + 600,
  });
}
