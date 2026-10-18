import { db } from "@/lib/db";
import { smsPaymentReceived } from "@/lib/notify";
import type { PaystackTransaction } from "@/lib/paystack";

/**
 * Records a successful Paystack transaction against its application and texts the customer.
 * Called from both the payment callback page and the webhook, so it is safe to call twice.
 * Returns the updated application, or null if the transaction doesn't match one.
 */
export async function recordPayment(tx: PaystackTransaction) {
  if (tx.status !== "success" || tx.currency !== "GHS") return null;
  const id = tx.metadata?.applicationId;
  const app = id ? await db.get("applications", id) : undefined;
  if (!app) return null;
  if (app.payment) return app; // already recorded

  const paid = tx.amount / 100;
  if (paid < app.amount) {
    console.error(`Payment ${tx.reference} is GH₵${paid}, expected GH₵${app.amount}`);
    return null;
  }

  const payment = {
    status: "paid" as const,
    reference: tx.reference,
    amount: paid,
    channel: tx.channel,
    paidAt: tx.paid_at ?? new Date().toISOString(),
  };
  const updated = await db.addPayment(app.id, payment);
  if (!updated) return (await db.get("applications", app.id)) ?? null; // recorded by the other request
  await smsPaymentReceived(updated);
  return updated;
}
