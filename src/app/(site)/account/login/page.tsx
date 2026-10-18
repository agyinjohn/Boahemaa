import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileCheck, ShieldCheck, Smartphone } from "lucide-react";
import { currentCustomer } from "@/lib/customer";
import { issueFormToken, turnstileSiteKey } from "@/lib/spam";
import { LoginFlow } from "./LoginFlow";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CustomerLoginPage() {
  if (await currentCustomer()) redirect("/account");
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-gold-200/40 blur-3xl" />
      <div className="container-x relative grid items-center gap-14 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <span className="eyebrow">My SUSU BOX</span>
          <h1 className="mt-5 text-5xl font-medium leading-[1.02] text-forest-950 md:text-6xl">
            Your cover, <em className="text-forest-600">in your pocket</em>.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">Sign in with the phone number you used to apply. No password needed.</p>
          <ul className="mt-10 space-y-5">
            {[
              { icon: ShieldCheck, title: "See your policies", text: "Status, plan and payments in one place." },
              { icon: FileCheck, title: "Make a claim online", text: "Upload photos and track progress." },
              { icon: Smartphone, title: "Sign in by SMS", text: "We text you a 6-digit code." },
            ].map((f) => (
              <li key={f.title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest-900 text-gold-400"><f.icon className="h-5 w-5" /></span>
                <div>
                  <p className="font-semibold text-forest-950">{f.title}</p>
                  <p className="text-sm text-muted">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <LoginFlow formToken={issueFormToken()} turnstileSiteKey={turnstileSiteKey} />
      </div>
    </section>
  );
}
