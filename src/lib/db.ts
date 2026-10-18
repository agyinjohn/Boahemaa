import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { Redis } from "@upstash/redis";
import seedNews from "../../data/news.json";

/*
 * A tiny JSON "database". Each collection is stored as one JSON value:
 * - in Upstash Redis when its env vars are set (needed on Vercel, whose disk is read-only), or
 * - in data/<name>.json on the local disk otherwise.
 */

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

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

type Collections = { news: News; videos: Video; applications: Application; sms: SmsLog };

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

// The sample news stories are shown until the first change is saved to Redis.
const seeds: Partial<{ [K in keyof Collections]: Collections[K][] }> = { news: seedNews as News[] };

const read = <K extends keyof Collections>(name: K) => readValue<Collections[K][]>(name, seeds[name] ?? []);
const write = <K extends keyof Collections>(name: K, rows: Collections[K][]) => writeValue(name, rows);

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

/* Team photos: a map of team member slug → photo URL. */

export const getTeamPhotos = () => readValue<Record<string, string>>("team-photos", {});

export function setTeamPhoto(slug: string, url: string | undefined) {
  return serialized("team-photos", async () => {
    const photos = await getTeamPhotos();
    if (url) photos[slug] = url;
    else delete photos[slug];
    await writeValue("team-photos", photos);
  });
}
