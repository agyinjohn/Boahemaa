import type { Application, Claim, ClaimStatus } from "@/lib/db";
import { sendSms } from "@/lib/sms";
import { cedis } from "@/lib/site";

// The SMS messages SUSU BOX sends. Keep them short: one SMS is 160 characters.

const firstName = (a: Application) => a.fullName.split(" ")[0];

export function smsApplicationReceived(a: Application, payUrl: string) {
  return sendSms(
    a.phone,
    `Hi ${firstName(a)}, your SUSU BOX ${a.product} application (${a.reference}) was received. Pay your first premium of ${cedis(a.amount)} here: ${payUrl}`,
  );
}

export function smsPaymentReceived(a: Application) {
  return sendSms(
    a.phone,
    `Payment received! ${cedis(a.payment!.amount)} for SUSU BOX ${a.product} (${a.plan}), ref ${a.reference}. An advisor will call you to activate your cover. Thank you!`,
  );
}

const statusText: Partial<Record<Application["status"], string>> = {
  "Under Review": "is now under review. We'll be in touch soon.",
  Approved: "has been APPROVED. Welcome to SUSU BOX, you are now covered!",
  Rejected: "could not be approved this time. Please call us for more details.",
};

export function smsStatusChanged(a: Application) {
  const text = statusText[a.status];
  if (!text) return;
  return sendSms(a.phone, `Hi ${firstName(a)}, your SUSU BOX application ${a.reference} ${text}`);
}

/** Alerts staff about a new application, if ADMIN_SMS_PHONE is set. */
export function smsAdminNewApplication(a: Application) {
  const phone = process.env.ADMIN_SMS_PHONE;
  if (!phone) return;
  return sendSms(phone, `New application ${a.reference}: ${a.fullName}, ${a.product} (${a.plan}), ${a.phone}.`);
}

/* Claims */

export function smsClaimReceived(c: Claim, trackUrl: string) {
  return sendSms(c.phone, `SUSU BOX: we received your ${c.type.toLowerCase()} claim ${c.reference}. We'll review it within 7 days. Track it here: ${trackUrl}`);
}

const claimStatusText: Partial<Record<ClaimStatus, string>> = {
  "Under Review": "is now being reviewed.",
  "More Info Needed": "needs more information from you.",
  Approved: "has been APPROVED.",
  Paid: "has been PAID. Thank you for trusting SUSU BOX.",
  Rejected: "could not be approved.",
};

export function smsClaimStatus(c: Claim, note?: string) {
  const text = claimStatusText[c.status];
  if (!text) return;
  const amount = c.approvedAmount && (c.status === "Approved" || c.status === "Paid") ? ` Amount: ${cedis(c.approvedAmount)}.` : "";
  const extra = note ? ` Note: ${note.length > 120 ? note.slice(0, 117) + "…" : note}` : "";
  return sendSms(c.phone, `SUSU BOX claim ${c.reference} ${text}${amount}${extra}`);
}

export function smsAdminNewClaim(c: Claim) {
  const phone = process.env.ADMIN_SMS_PHONE;
  if (!phone) return;
  const amount = c.amountClaimed ? `, ${cedis(c.amountClaimed)}` : "";
  return sendSms(phone, `New claim ${c.reference}: ${c.customerName}, ${c.product} (${c.type}${amount}).`);
}
