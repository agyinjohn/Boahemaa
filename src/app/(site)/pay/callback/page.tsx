import type { Metadata } from "next";
import Link from "next/link";
import { CircleX } from "lucide-react";
import { verifyPayment } from "@/lib/paystack";
import { recordPayment } from "@/lib/payments";
import { Receipt } from "@/components/pay/Receipt";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };
export const dynamic = "force-dynamic";

// Paystack sends the customer back here with ?reference=… after checkout.
export default async function PaymentCallback({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  const { reference } = await searchParams;
  let app = null;
  let failed = "We couldn't confirm this payment.";
  if (reference) {
    try {
      const tx = await verifyPayment(reference);
      app = await recordPayment(tx);
      if (!app && tx.status !== "success") failed = "Your payment was not completed. No money was taken.";
    } catch (err) {
      console.error("Paystack verify failed", err);
    }
  }
  // Paystack references look like SB-2026-7KQ4XM-<suffix>; the first three parts are the application.
  const appReference = reference?.split("-").slice(0, 3).join("-");

  return (
    <section className="container-x max-w-xl py-16 md:py-24">
      {app ? (
        <Receipt app={app} />
      ) : (
        <div className="card p-8 text-center md:p-12">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-clay-500/10 text-clay-500">
            <CircleX className="h-10 w-10" />
          </span>
          <h1 className="mt-6 text-4xl font-medium text-forest-950">Payment not confirmed</h1>
          <p className="mt-3 text-muted">{failed}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {appReference && <Link href={`/pay/${appReference}`} className="btn btn-primary">Try again</Link>}
            <Link href="/contact" className="btn btn-ghost">Contact us</Link>
          </div>
        </div>
      )}
      <p className="mt-8 text-center">
        <Link href="/" className="text-sm font-semibold text-forest-700 hover:underline">Back to home</Link>
      </p>
    </section>
  );
}
