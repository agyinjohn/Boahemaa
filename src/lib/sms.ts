import { db, newId } from "@/lib/db";

/*
 * SMS through mNotify (https://mnotify.com). Set MNOTIFY_API_KEY and MNOTIFY_SENDER_ID
 * (a sender ID approved on your mNotify account, max 11 characters).
 * Without them, messages are only recorded in the admin SMS log as "simulated".
 */

const apiKey = process.env.MNOTIFY_API_KEY;
const senderId = process.env.MNOTIFY_SENDER_ID || "SUSUBOX";
export const smsEnabled = Boolean(apiKey);

/** Converts +233 24 123 4567 / 233241234567 / 0241234567 to the local 0241234567 format mNotify expects. */
export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("233") && digits.length === 12) return "0" + digits.slice(3);
  return digits;
}

/** Sends one SMS and records it in the SMS log. Never throws, so a failed SMS can't break a payment or form. */
export async function sendSms(phone: string, message: string) {
  const to = normalizePhone(phone);
  let status: "sent" | "failed" | "simulated" = "simulated";
  let error: string | undefined;

  if (smsEnabled) {
    try {
      const res = await fetch(`https://api.mnotify.com/api/sms/quick?key=${encodeURIComponent(apiKey!)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ recipient: [to], sender: senderId, message, is_schedule: false, schedule_date: "" }),
        signal: AbortSignal.timeout(10_000),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.status === "success") {
        status = "sent";
      } else {
        status = "failed";
        error = json.message || json.error || `HTTP ${res.status}`;
      }
    } catch (err) {
      status = "failed";
      error = err instanceof Error ? err.message : "Network error";
    }
  }

  try {
    await db.insert("sms", { id: newId(), to, message, status, error, createdAt: new Date().toISOString() }, 200);
  } catch (err) {
    console.error("Could not save SMS log", err);
  }
  return status;
}
