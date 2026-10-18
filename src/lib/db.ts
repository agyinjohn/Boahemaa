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
  createdAt: string;
};

type Collections = { news: News; videos: Video; applications: Application };

async function readValue<T>(key: string, fallback: T): Promise<T> {
  if (redis) return (await redis.get<T>(`susubox:${key}`)) ?? fallback;
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, `${key}.json`), "utf8"));
  } catch {
    return fallback;
  }
}

async function writeValue(key: string, value: unknown) {
  if (redis) {
    await redis.set(`susubox:${key}`, value);
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, `${key}.json`), JSON.stringify(value, null, 2));
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

/* Team photos: a map of team member slug → photo URL. */

export const getTeamPhotos = () => readValue<Record<string, string>>("team-photos", {});

export async function setTeamPhoto(slug: string, url: string | undefined) {
  const photos = await getTeamPhotos();
  if (url) photos[slug] = url;
  else delete photos[slug];
  await writeValue("team-photos", photos);
}
