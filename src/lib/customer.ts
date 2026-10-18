import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/sms";

/*
 * Customer accounts. Customers sign in with their phone number and a one-time SMS code;
 * their account is everything (applications, claims) made with that phone number.
 * The session is a signed cookie holding the phone number and an expiry time.
 */

const COOKIE = "susubox_customer";
const DAYS = 30;
const secret = () => process.env.SESSION_SECRET || "susubox-dev-secret";
const sign = (value: string) => crypto.createHmac("sha256", secret()).update(`customer:${value}`).digest("hex");

export async function startCustomerSession(phone: string) {
  const expires = Date.now() + DAYS * 24 * 60 * 60 * 1000;
  const value = `${phone}.${expires}`;
  (await cookies()).set(COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DAYS * 24 * 60 * 60,
  });
}

export async function endCustomerSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in customer's phone number, or null. */
export async function currentCustomer(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [phone, expires, sig] = raw.split(".");
  if (!phone || !expires || !sig || Number(expires) < Date.now()) return null;
  const expected = sign(`${phone}.${expires}`);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return phone;
}

export async function requireCustomer() {
  const phone = await currentCustomer();
  if (!phone) redirect("/account/login");
  return phone;
}

/** Everything belonging to a customer: their applications (policies) and claims. */
export async function customerData(phone: string) {
  const [applications, claims] = await Promise.all([db.list("applications"), db.list("claims")]);
  const mine = applications.filter((a) => normalizePhone(a.phone) === phone);
  return {
    applications: mine,
    claims: claims.filter((c) => c.phone === phone),
    name: mine[0]?.fullName,
  };
}

/** A policy is active (and can be claimed on) once it's approved and the first premium is paid. */
export const isActivePolicy = (a: { status: string; payment?: unknown }) => a.status === "Approved" && Boolean(a.payment);

/** Whether the login code may be shown on screen (when SMS isn't set up). Always on in development. */
export const demoLoginAllowed = () => process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_LOGIN === "true";
