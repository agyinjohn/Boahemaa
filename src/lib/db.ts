import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { Redis } from "@upstash/redis";
import seedNews from "../../data/news.json";
import { projects as seedProjects, team as seedTeam } from "@/lib/site";

/*
 * A tiny JSON "database". Each collection is stored as one JSON value:
 * - in Upstash Redis when its env vars are set (needed on Vercel, whose disk is read-only), or
 * - in data/<name>.json on the local disk otherwise.
 */

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const DATA_DIR = path.join(process.cwd(), "data");

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
  /** First month's premium in GH₵, fixed when the application is made. */
  amount: number;
  payment?: Payment;
  createdAt: string;
};

export type Payment = {
  status: "paid";
  /** Paystack transaction reference */
  reference: string;
  amount: number;
  channel: string;
  paidAt: string;
};

export type SmsLog = {
  id: string;
  to: string;
  message: string;
  status: "sent" | "failed" | "simulated";
  error?: string;
  createdAt: string;
};

export type Message = {
  id: string;
  name: string;
  phone: string;
  email: string;
  topic: string;
  message: string;
  read: boolean;
  createdAt: string;
};

import { CLAIM_STATUSES, type ClaimStatus } from "@/lib/claimStatus";
export { CLAIM_STATUSES, type ClaimStatus };

export type Claim = {
  id: string;
  reference: string;
  /** The customer's phone in 0XXXXXXXXX form: this is what links a claim to an account. */
  phone: string;
  customerName: string;
  applicationId: string;
  policyReference: string;
  product: string;
  plan: string;
  type: string;
  incidentDate: string;
  description: string;
  amountClaimed?: number;
  approvedAmount?: number;
  /** Private document references (see lib/storage.ts). */
  documents: string[];
  status: ClaimStatus;
  history: { status: ClaimStatus; note?: string; at: string }[];
  createdAt: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  /** Members in the "Leadership" department are shown in the large cards. */
  dept: string;
  bio: string;
  photo?: string;
  order: number;
  createdAt: string;
};

export type Project = {
  id: string;
  title: string;
  place: string;
  year: string;
  tag: string;
  text: string;
  image?: string;
  order: number;
  createdAt: string;
};

type Collections = {
  news: News;
  videos: Video;
  applications: Application;
  sms: SmsLog;
  messages: Message;
  team: TeamMember;
  projects: Project;
  claims: Claim;
};

async function readValue<T>(key: string, fallback: T): Promise<T> {
  if (redis) return (await redis.get<T>(`susubox:${key}`)) ?? fallback;
  let raw: string;
  try {
    raw = await fs.readFile(path.join(DATA_DIR, `${key}.json`), "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw err;
  }
  // Deliberately not caught: treating a broken file as empty would wipe it on the next save.
  return JSON.parse(raw);
}

async function writeValue(key: string, value: unknown) {
  if (redis) {
    await redis.set(`susubox:${key}`, value);
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Write to a temp file and rename it into place, so readers never see a half-written file.
  const file = path.join(DATA_DIR, `${key}.json`);
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2));
  await fs.rename(tmp, file);
}

// Changes to the same collection run one at a time, so two saves can't overwrite each other.
const queues = new Map<string, Promise<unknown>>();
function serialized<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const run = (queues.get(key) ?? Promise.resolve()).catch(() => {}).then(fn);
  queues.set(key, run);
  return run;
}

// Starting content, used until the first change to a collection is saved.
const SEED_DATE = "2024-01-01T00:00:00.000Z";
const seeds: { [K in keyof Collections]?: () => Collections[K][] | Promise<Collections[K][]> } = {
  news: () => seedNews as News[],
  team: async () => {
    const photos = await getTeamPhotos(); // photos uploaded before the team was editable
    return seedTeam.map(({ slug, ...m }, order) => ({ id: slug, ...m, photo: photos[slug], order, createdAt: SEED_DATE }));
  },
  projects: () =>
    seedProjects.map((p, order) => ({ id: p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), ...p, order, createdAt: SEED_DATE })),
};

async function read<K extends keyof Collections>(name: K): Promise<Collections[K][]> {
  return (await readValue<Collections[K][] | null>(name, null)) ?? (await seeds[name]?.()) ?? [];
}
const write = <K extends keyof Collections>(name: K, rows: Collections[K][]) => writeValue(name, rows);

const newestFirst = <T extends { createdAt: string }>(rows: T[]) =>
  [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

/** Team and projects are shown in the order set in the admin; everything else newest first. */
const sorted = <T extends { createdAt: string }>(rows: T[]) =>
  rows.length > 0 && typeof (rows[0] as { order?: unknown }).order === "number"
    ? [...rows].sort((a, b) => (a as unknown as { order: number }).order - (b as unknown as { order: number }).order)
    : newestFirst(rows);

export const newId = () => crypto.randomUUID();

export const db = {
  async list<K extends keyof Collections>(name: K) {
    return sorted(await read(name));
  },
  /** Moves a team member or project one place up (-1) or down (+1). */
  move(name: "team" | "projects", id: string, direction: -1 | 1) {
    return serialized(name, async () => {
      const rows = sorted(await read(name)) as { id: string; order: number }[];
      const i = rows.findIndex((r) => r.id === id);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= rows.length) return;
      [rows[i], rows[j]] = [rows[j], rows[i]];
      rows.forEach((r, order) => (r.order = order));
      await write(name, rows as Collections[typeof name][]);
    });
  },
  /** The `order` value that puts a new row at the end. */
  async nextOrder(name: "team" | "projects") {
    const rows = await read(name);
    return rows.reduce((max, r) => Math.max(max, r.order + 1), 0);
  },
  async get<K extends keyof Collections>(name: K, id: string) {
    return (await read(name)).find((row) => row.id === id);
  },
  /** Saves a payment unless the application already has one. Returns the updated application, or null if it was already paid. */
  addPayment(id: string, payment: Payment) {
    return serialized("applications", async () => {
      const rows = await read("applications");
      const app = rows.find((a) => a.id === id);
      if (!app || app.payment) return null;
      app.payment = payment;
      await write("applications", rows);
      return app;
    });
  },
  async findApplication(reference: string) {
    return (await read("applications")).find((a) => a.reference === reference);
  },
  /** Adds a row. With `keep`, only the newest `keep` rows are kept (used for the SMS log). */
  insert<K extends keyof Collections>(name: K, row: Collections[K], keep?: number) {
    return serialized(name, async () => {
      const rows = await read(name);
      rows.push(row);
      await write(name, keep ? newestFirst(rows).slice(0, keep) : rows);
      return row;
    });
  },
  update<K extends keyof Collections>(name: K, id: string, patch: Partial<Collections[K]>) {
    return serialized(name, async () => {
      const rows = await read(name);
      await write(name, rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    });
  },
  remove<K extends keyof Collections>(name: K, id: string) {
    return serialized(name, async () => {
      const rows = await read(name);
      const row = rows.find((r) => r.id === id);
      await write(name, rows.filter((r) => r.id !== id));
      return row;
    });
  },
};

/* Team photos uploaded before team members could be edited (slug → URL); read once when seeding the team. */
const getTeamPhotos = () => readValue<Record<string, string>>("team-photos", {});

/*
 * Short-lived values with an expiry (login codes): Redis on Vercel, memory locally.
 */
const memoryKv = new Map<string, { value: unknown; expires: number }>();

export const kv = {
  async get<T>(key: string): Promise<T | null> {
    if (redis) return redis.get<T>(`susubox:kv:${key}`);
    const entry = memoryKv.get(key);
    if (!entry || entry.expires < Date.now()) {
      memoryKv.delete(key);
      return null;
    }
    return entry.value as T;
  },
  async set(key: string, value: unknown, ttlSeconds: number) {
    if (redis) await redis.set(`susubox:kv:${key}`, value, { ex: ttlSeconds });
    else memoryKv.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
  },
  async del(key: string) {
    if (redis) await redis.del(`susubox:kv:${key}`);
    else memoryKv.delete(key);
  },
};
