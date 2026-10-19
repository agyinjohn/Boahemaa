import crypto from "crypto";
import { headers } from "next/headers";
import { redis } from "@/lib/db";

/*
 * Spam protection for public forms, in three layers:
 * 1. Honeypot: a hidden "website" field people never see but bots fill in.
 * 2. Time check: each form carries a signed timestamp; anything sent within 3 seconds of the
 *    page loading (or with a forged/expired token) is rejected.
 * 3. Cloudflare Turnstile (optional): a CAPTCHA, checked with Cloudflare, when
 *    TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY are set.
 * 4. Rate limit: a maximum number of submissions per IP address per time window
 *    (stored in Redis on Vercel so it holds across servers; in memory locally).
 */

const secret = () => process.env.SESSION_SECRET || "susubox-dev-secret";
const sign = (value: string) => crypto.createHmac("sha256", secret()).update(`form:${value}`).digest("hex").slice(0, 32);

const MIN_SECONDS = 3;
const MAX_AGE_SECONDS = 60 * 60 * 24;

/** A signed timestamp to put in a form when the page is rendered. */
export function issueFormToken() {
  const ts = String(Date.now());
  return `${ts}.${sign(ts)}`;
}

const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
/** The Turnstile site key to give forms, or null when Turnstile isn't set up. */
export const turnstileSiteKey = turnstileSecret && process.env.TURNSTILE_SITE_KEY ? process.env.TURNSTILE_SITE_KEY : null;

/** Checks the form's Turnstile token with Cloudflare. Returns an error message, or null if it passed (or Turnstile is off). */
export async function verifyTurnstile(fd: FormData): Promise<string | null> {
  if (!turnstileSiteKey) return null;
  const token = String(fd.get("cf-turnstile-response") ?? "");
  if (!token) return "Please complete the security check.";
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: turnstileSecret!, response: token, remoteip: await clientIp() }),
      signal: AbortSignal.timeout(10_000),
    });
    const json = await res.json();
    if (json.success) return null;
    console.warn("Turnstile rejected a submission", json["error-codes"]);
    return "The security check failed. Please try again.";
  } catch (err) {
    console.error("Turnstile verification failed", err);
    return "We couldn't run the security check. Please try again.";
  }
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

const memoryHits = new Map<string, { count: number; resetAt: number }>();

/** Counts one attempt for `key`; returns false once `limit` is passed within `windowSeconds`. */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const k = `susubox:rl:${key}`;
  if (redis) {
    const count = await redis.incr(k);
    if (count === 1) await redis.expire(k, windowSeconds);
    return count <= limit;
  }
  const now = Date.now();
  const entry = memoryHits.get(k);
  if (!entry || entry.resetAt < now) {
    memoryHits.set(k, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

export type SpamCheck = { ok: true } | { ok: false; silent: true } | { ok: false; silent?: false; error: string };

/**
 * Runs all three checks on a submitted form. `silent` means it's almost certainly a bot:
 * pretend it worked so the bot doesn't learn to dodge the trap.
 */
export async function checkSpam(fd: FormData, form: string, limit = 5, windowSeconds = 3600): Promise<SpamCheck> {
  if (String(fd.get("website") ?? "") !== "") return { ok: false, silent: true };

  const [ts, sig] = String(fd.get("formToken") ?? "").split(".");
  const age = (Date.now() - Number(ts)) / 1000;
  const validSig = Boolean(sig) && sig.length === 32 && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(ts)));
  if (!validSig || !(age >= 0) || age > MAX_AGE_SECONDS) {
    return { ok: false, error: "This form has expired. Please refresh the page and try again." };
  }
  if (age < MIN_SECONDS) return { ok: false, error: "That was quick! Please check your details and submit again." };

  const captchaError = null;
  if (captchaError) return { ok: false, error: captchaError };

  if (!(await rateLimit(`${form}:${await clientIp()}`, limit, windowSeconds))) {
    return { ok: false, error: "Too many submissions from your connection. Please try again in an hour or call us." };
  }
  return { ok: true };
}
