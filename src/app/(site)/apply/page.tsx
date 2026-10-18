import type { Metadata } from "next";
import { Clock, Lock, PhoneCall, Smartphone } from "lucide-react";
import { ApplyForm } from "./ApplyForm";
import { paystackEnabled } from "@/lib/paystack";

export const metadata: Metadata = { title: "Apply Online" };

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams;

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-gold-200/40 blur-3xl" />
      <div className="container-x relative grid gap-14 pb-28 pt-14 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <span className="eyebrow">Application portal</span>
          <h1 className="mt-5 text-5xl font-medium leading-[1.02] text-forest-950 md:text-6xl">
            Apply for cover in <em className="text-forest-600">minutes</em>.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            Tell us a little about yourself and the cover you need. An advisor will call you to confirm and activate your policy.
          </p>
          <ul className="mt-10 space-y-5">
            {[
              { icon: Clock, title: "About 5 minutes", text: "Three short steps, no paperwork." },
              { icon: PhoneCall, title: "Call back within 1 day", text: "A real advisor confirms your plan." },
              { icon: Smartphone, title: "Pay with MoMo or card", text: "Secure checkout by Paystack." },
              { icon: Lock, title: "Your data is safe", text: "Only SUSU BOX staff can see your details." },
            ].map((f) => (
              <li key={f.title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest-900 text-gold-400">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-forest-950">{f.title}</p>
                  <p className="text-sm text-muted">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
        <ApplyForm initialProduct={product} paymentsEnabled={paystackEnabled} />
      </div>
    </section>
  );
}
