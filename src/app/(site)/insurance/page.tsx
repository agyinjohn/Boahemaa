import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ProductIcon } from "@/components/ProductIcon";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";
import { cedis, products } from "@/lib/site";

export const metadata: Metadata = { title: "Insurance Plans" };

export default function InsurancePage() {
  return (
    <>
      <PageHero
        eyebrow="Insurance plans"
        title={<>Cover that fits your <em className="text-forest-600">day-to-day</em>.</>}
        intro="Every plan can be paid daily, weekly or monthly by mobile money, so protection never has to wait for payday."
      />
      <section className="container-x space-y-6 pb-12">
        {products.map((p, i) => (
          <Reveal key={p.slug}>
            <article
              id={p.slug}
              className={`grid scroll-mt-28 gap-10 overflow-hidden rounded-[2.5rem] p-8 md:grid-cols-[auto_1fr_auto] md:items-center md:p-12 ${
                i % 2 ? "bg-forest-900 text-cream" : "card"
              }`}
            >
              <span className={`grid h-24 w-24 place-items-center rounded-[1.75rem] ${i % 2 ? "bg-gold-500 text-forest-950" : "bg-forest-50 text-forest-700"}`}>
                <ProductIcon name={p.icon} className="h-10 w-10" strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="text-4xl font-medium">{p.name}</h2>
                <p className={`mt-3 max-w-xl ${i % 2 ? "text-cream/70" : "text-muted"}`}>{p.summary}</p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                  {p.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${i % 2 ? "text-gold-400" : "text-forest-600"}`} /> {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  {p.plans.map((plan) => (
                    <span key={plan.name} className={`rounded-full px-3 py-1 text-xs font-medium ${i % 2 ? "bg-cream/10" : "bg-forest-50 text-forest-800"}`}>
                      {plan.name} · {cedis(plan.monthly)}/mo
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:text-right">
                <p className={`text-xs uppercase tracking-[0.18em] ${i % 2 ? "text-cream/50" : "text-muted"}`}>From</p>
                <p className="font-display text-4xl">{p.from}</p>
                <Link href={`/apply?product=${p.slug}`} className={`btn mt-6 ${i % 2 ? "btn-gold" : "btn-primary"}`}>
                  Apply <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </section>
      <CtaBand />
    </>
  );
}
