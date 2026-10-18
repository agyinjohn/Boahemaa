import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// A tiny JSON-file "database". Each collection is a file in /data.
const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
// Customer ID documents live here and are only served to logged-in admins.
export const PRIVATE_DIR = path.join(UPLOAD_DIR, "private");

export type News = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  image?: string;
  createdAt: string;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  youtubeId?: string;
  file?: string;
  createdAt: string;
};

export type ApplicationStatus = "Pending" | "Under Review" | "Approved" | "Rejected";

export type Application = {
  id: string;
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  region: string;
  occupation: string;
  product: string;
  plan: string;
  message: string;
  document?: string;
  status: ApplicationStatus;
  createdAt: string;
};

type Collections = { news: News; videos: Video; applications: Application };

async function read<K extends keyof Collections>(name: K): Promise<Collections[K][]> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function write<K extends keyof Collections>(name: K, rows: Collections[K][]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, `${name}.json`), JSON.stringify(rows, null, 2));
}

const newestFirst = <T extends { createdAt: string }>(rows: T[]) =>
  [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const newId = () => crypto.randomUUID();

export const db = {
  async list<K extends keyof Collections>(name: K) {
    return newestFirst(await read(name));
  },
  async get<K extends keyof Collections>(name: K, id: string) {
    return (await read(name)).find((row) => row.id === id);
  },
  async insert<K extends keyof Collections>(name: K, row: Collections[K]) {
    const rows = await read(name);
    rows.push(row);
    await write(name, rows);
    return row;
  },
  async update<K extends keyof Collections>(name: K, id: string, patch: Partial<Collections[K]>) {
    const rows = await read(name);
    const next = rows.map((row) => (row.id === id ? { ...row, ...patch } : row));
    await write(name, next);
  },
  async remove<K extends keyof Collections>(name: K, id: string) {
    const rows = await read(name);
    const row = rows.find((r) => r.id === id);
    await write(name, rows.filter((r) => r.id !== id));
    return row;
  },
};

/* Team photos: a map of team member slug → uploaded photo URL. */
const TEAM_PHOTOS = path.join(DATA_DIR, "team-photos.json");

export async function getTeamPhotos(): Promise<Record<string, string>> {
  try {
    return JSON.parse(await fs.readFile(TEAM_PHOTOS, "utf8"));
  } catch {
    return {};
  }
}

export async function setTeamPhoto(slug: string, url: string | undefined) {
  const photos = await getTeamPhotos();
  if (url) photos[slug] = url;
  else delete photos[slug];
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(TEAM_PHOTOS, JSON.stringify(photos, null, 2));
}

const ALLOWED = /\.(jpe?g|png|webp|gif|pdf|mp4|webm|mov)$/i;

/**
 * Saves an uploaded file and returns its URL, or undefined if no file was sent.
 * Private files (customer documents) are served from /admin/documents behind the admin login.
 */
export async function saveUpload(file: FormDataEntryValue | null, isPrivate = false): Promise<string | undefined> {
  if (!(file instanceof File) || file.size === 0) return undefined;
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED.test(ext)) throw new Error("Unsupported file type");
  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  const dir = isPrivate ? PRIVATE_DIR : UPLOAD_DIR;
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return isPrivate ? `/admin/documents/${name}` : `/uploads/${name}`;
}

export async function deleteUpload(url?: string) {
  if (url?.startsWith("/uploads/")) await fs.rm(path.join(UPLOAD_DIR, path.basename(url)), { force: true });
  if (url?.startsWith("/admin/documents/")) await fs.rm(path.join(PRIVATE_DIR, path.basename(url)), { force: true });
}
