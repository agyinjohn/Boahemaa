import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { cedis } from "@/lib/site";
import { PayButton } from "@/components/pay/PayButton";
import { Receipt } from "@/components/pay/Receipt";

export const metadata: Metadata = { title: "Pay your premium", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PayPage({ params }: { params: Promise<{ reference: string }> }) {
  const app = await db.findApplication((await params).reference);
  if (!app) notFound();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-40 -top-20 h-[30rem] w-[30rem] rounded-full bg-gold-200/40 blur-3xl" />
      <div className="container-x relative max-w-xl py-16 md:py-24">
        {app.payment ? (
          <Receipt app={app} />
        ) : (
          <div className="card relative overflow-hidden p-8 md:p-12">
            <div className="kente-strip absolute inset-x-0 top-0 h-2" />
            <span className="eyebrow">Premium payment</span>
            <h1 className="mt-4 text-4xl font-medium text-forest-950">Hi {app.fullName.split(" ")[0]}, you&apos;re one step away.</h1>
            <p className="mt-3 text-muted">Pay your first month&apos;s premium to start your cover.</p>
            <div className="mt-8 rounded-3xl bg-forest-900 p-6 text-cream">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-cream/50">{app.product}</p>
                  <p className="mt-1 font-display text-2xl">{app.plan} plan</p>
                </div>
                <span className="rounded-full bg-cream/10 px-3 py-1 font-mono text-xs">{app.reference}</span>
              </div>
              <div className="mt-6 flex items-end justify-between border-t border-cream/10 pt-5">
                <p className="text-sm text-cream/60">First month</p>
                <p className="font-display text-4xl text-gold-400">{cedis(app.amount)}</p>
              </div>
            </div>
            <PayButton reference={app.reference} amount={app.amount} className="mt-8" />
            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-forest-600" /> Secured by Paystack. SUSU BOX never sees your card or PIN.
            </p>
          </div>
        )}
        <p className="mt-8 text-center text-sm text-muted">
          Need help? <Link href="/contact" className="font-semibold text-forest-700 hover:underline">Contact us</Link>
        </p>
      </div>
    </section>
  );
}
