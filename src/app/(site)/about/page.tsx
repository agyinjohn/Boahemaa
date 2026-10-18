import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";
import { stats, timeline, values } from "@/lib/site";

export const metadata: Metadata = { title: "Our Story" };

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title={<>From a savings box to a <em className="text-forest-600">nation&apos;s</em> safety net.</>}
        intro="SUSU BOX grew out of the oldest financial tradition in Ghana: people putting a little aside together, every day, so nobody faces hard times alone."
      />

      <section className="container-x pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-forest-900 p-10 text-cream md:p-16 grain">
            <div className="kente absolute inset-0 opacity-20" />
            <p className="relative max-w-4xl font-display text-3xl font-light leading-snug md:text-5xl">
              &ldquo;Our grandmothers trusted the susu collector with their savings. We wanted to earn that same trust
              and turn it into <em className="text-gold-400">real protection</em>.&rdquo;
            </p>
            <p className="relative mt-8 text-sm uppercase tracking-[0.2em] text-cream/60">Akosua Mensah · Founder & CEO</p>
          </div>
        </Reveal>
      </section>

      {/* Timeline */}
      <section className="container-x py-16">
        <Reveal>
          <span className="eyebrow">Milestones</span>
          <h2 className="mt-4 text-4xl font-medium text-forest-950 md:text-5xl">The road so far</h2>
        </Reveal>
        <ol className="relative mt-16">
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-gradient-to-b from-gold-500 via-forest-600 to-transparent md:left-1/2" />
          {timeline.map((t, i) => (
            <li key={t.year} className={`relative mb-16 pl-12 md:w-1/2 md:pl-0 ${i % 2 ? "md:ml-auto md:pl-16" : "md:pr-16 md:text-right"}`}>
              <span
                className={`absolute left-0 top-3 h-4 w-4 rounded-full border-4 border-cream bg-gold-500 ring-1 ring-gold-500 ${
                  i % 2 ? "md:-left-2" : "md:left-auto md:-right-2"
                }`}
              />
              <Reveal delay={80}>
                <p className="font-display text-6xl font-light text-gold-600">{t.year}</p>
                <h3 className="mt-2 text-2xl font-medium text-forest-950">{t.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{t.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Mission / Vision / Values */}
      <section className="bg-sand py-24">
        <div className="container-x grid gap-5 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 100}>
              <div className="card h-full p-10">
                <span className="font-display text-sm text-gold-600">0{i + 1}</span>
                <h3 className="mt-6 text-3xl font-medium text-forest-950">{v.title}</h3>
                <p className="mt-4 leading-relaxed text-muted">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-10 py-24 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border-t border-forest-900/15 pt-6">
            <p className="font-display text-5xl font-light text-forest-900">{s.value}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.16em] text-muted">{s.label}</p>
          </div>
        ))}
      </section>

      <CtaBand />
    </>
  );
}
