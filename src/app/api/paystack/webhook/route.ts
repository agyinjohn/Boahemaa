import { validWebhookSignature, verifyPayment } from "@/lib/paystack";
import { recordPayment } from "@/lib/payments";

/*
 * Paystack webhook: records payments even if the customer closes the browser before returning
 * to the site. Set the webhook URL in Paystack (Settings → API Keys & Webhooks) to
 * https://<your-site>/api/paystack/webhook
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!validWebhookSignature(raw, req.headers.get("x-paystack-signature"))) {
    return new Response("Invalid signature", { status: 401 });
  }
  const event = JSON.parse(raw);
  if (event.event === "charge.success" && event.data?.reference) {
    try {
      // Re-check with Paystack rather than trusting the payload alone.
      await recordPayment(await verifyPayment(event.data.reference));
    } catch (err) {
      console.error("Webhook payment failed", err);
      return new Response("Error", { status: 500 }); // Paystack will retry
    }
  }
  return new Response("OK");
}
