import crypto from "crypto";

/*
 * Paystack (https://paystack.com) for premium payments by mobile money or card.
 * Set PAYSTACK_SECRET_KEY (sk_test_… for testing, sk_live_… for real money).
 */

const secretKey = process.env.PAYSTACK_SECRET_KEY;
export const paystackEnabled = Boolean(secretKey);

async function paystack<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const json = await res.json();
  if (!res.ok || !json.status) throw new Error(json.message || `Paystack error ${res.status}`);
  return json.data as T;
}

/** Starts a payment and returns the Paystack checkout URL to send the customer to. */
export async function initializePayment(opts: {
  email: string;
  amount: number; // GH₵
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}) {
  const data = await paystack<{ authorization_url: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: opts.email,
      amount: Math.round(opts.amount * 100), // pesewas
      currency: "GHS",
      reference: opts.reference,
      callback_url: opts.callbackUrl,
      channels: ["mobile_money", "card"],
      metadata: opts.metadata,
    }),
  });
  return data.authorization_url;
}

export type PaystackTransaction = {
  status: string; // "success" | "failed" | "abandoned" | …
  reference: string;
  amount: number; // pesewas
  currency: string;
  channel: string;
  paid_at: string | null;
  metadata: { applicationId?: string } | null;
};

export const verifyPayment = (reference: string) =>
  paystack<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);

/** Checks that a webhook request really came from Paystack. */
export function validWebhookSignature(rawBody: string, signature: string | null) {
  if (!secretKey || !signature) return false;
  const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  return expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
