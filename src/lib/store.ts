import { Redis as UpstashRedis } from "@upstash/redis";
import { createClient } from "redis";

/*
 * The database connection, picked from environment variables:
 * - Upstash Redis over HTTPS: KV_REST_API_URL + KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL + _TOKEN
 *   (also with a custom prefix, e.g. STORAGE_KV_REST_API_URL, which Vercel adds when you choose one).
 * - Any Redis server: REDIS_URL (or KV_URL), e.g. from Vercel's "Redis" storage.
 * Without either, `store` is null and data goes to JSON files (fine locally, impossible on Vercel).
 */

export type Store = {
  kind: string;
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
};

/** Finds an env var by exact name, or by suffix (to allow prefixes like STORAGE_). */
function env(...names: string[]) {
  for (const name of names) if (process.env[name]) return { name, value: process.env[name]! };
  for (const name of names) {
    const key = Object.keys(process.env).find((k) => k.endsWith(`_${name}`) && process.env[k]);
    if (key) return { name: key, value: process.env[key]! };
  }
  return null;
}

function upstashStore(): Store | null {
  const url = env("KV_REST_API_URL", "UPSTASH_REDIS_REST_URL");
  if (!url) return null;
  // Use the token that belongs with the URL (same prefix), never the read-only one.
  const prefix = url.name.replace(/(KV_REST_API_URL|UPSTASH_REDIS_REST_URL)$/, "");
  const token =
    process.env[`${prefix}KV_REST_API_TOKEN`] ||
    process.env[`${prefix}UPSTASH_REDIS_REST_TOKEN`] ||
    env("KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_TOKEN")?.value;
  if (!token) return null;
  const r = new UpstashRedis({ url: url.value, token });
  return {
    kind: "Upstash Redis",
    get: (key) => r.get(key),
    set: async (key, value, ttl) => {
      await (ttl ? r.set(key, value, { ex: ttl }) : r.set(key, value));
    },
    del: async (key) => {
      await r.del(key);
    },
    incr: (key) => r.incr(key),
    expire: async (key, seconds) => {
      await r.expire(key, seconds);
    },
  };
}

function redisUrlStore(): Store | null {
  const url = env("REDIS_URL", "KV_URL");
  if (!url || !/^rediss?:\/\//.test(url.value)) return null;
  let client: Promise<ReturnType<typeof createClient>> | null = null;
  // Connect once per server instance, on first use.
  const conn = () => {
    client ??= (async () => {
      const c = createClient({ url: url.value });
      c.on("error", (err) => console.error("Redis error", err));
      await c.connect();
      return c;
    })().catch((err) => {
      client = null;
      throw err;
    });
    return client;
  };
  return {
    kind: "Redis",
    get: async (key) => {
      const raw = await (await conn()).get(key);
      return raw == null ? null : JSON.parse(String(raw));
    },
    set: async (key, value, ttl) => {
      await (await conn()).set(key, JSON.stringify(value), ttl ? { EX: ttl } : undefined);
    },
    del: async (key) => {
      await (await conn()).del(key);
    },
    incr: async (key) => Number(await (await conn()).incr(key)),
    expire: async (key, seconds) => {
      await (await conn()).expire(key, seconds);
    },
  };
}

export const store: Store | null = upstashStore() ?? redisUrlStore();

/** True on Vercel and similar hosts, where files written while running are not kept. */
export const readOnlyHost = Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);

/** Thrown when there's nowhere to save data or files, so forms can show a helpful message instead of crashing. */
export class StorageNotConfiguredError extends Error {}
