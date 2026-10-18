import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { company } from "@/lib/site";

export function CtaBand() {
  return (
    <section className="container-x py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-forest-900 px-8 py-16 text-cream md:px-16 md:py-20 grain">
        <div className="kente absolute inset-y-0 right-0 hidden w-1/3 opacity-90 md:block [mask-image:linear-gradient(to_left,black,transparent)]" />
        <div className="relative max-w-2xl">
          <span className="eyebrow text-gold-400">Start today</span>
          <h2 className="mt-5 text-4xl font-medium leading-tight md:text-6xl">
            Protection from just <em className="whitespace-nowrap text-gold-400">GH₵ 1</em> a day.
          </h2>
          <p className="mt-5 max-w-lg text-cream/70">
            Apply online in five minutes. One of our advisors will call you within one working day to complete your cover.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/apply" className="btn btn-gold">
              Apply online <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="btn btn-ghost-light">
              <Phone className="h-4 w-4" /> {company.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
