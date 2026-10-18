import type { Application } from "@/lib/db";
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
