import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "susubox_admin";
const password = () => process.env.ADMIN_PASSWORD || "susubox123";
const secret = () => process.env.SESSION_SECRET || "susubox-dev-secret";
const token = () => crypto.createHmac("sha256", secret()).update(password()).digest("hex");

export function checkPassword(input: string) {
  const a = Buffer.from(input);
  const b = Buffer.from(password());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function startSession() {
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  return (await cookies()).get(COOKIE)?.value === token();
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
