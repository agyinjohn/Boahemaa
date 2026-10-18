import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, CircleCheck, ClipboardList, PhoneCall, ShieldCheck, Smartphone, Star } from "lucide-react";
import { db } from "@/lib/db";
import { products, stats, timeline } from "@/lib/site";
import { ProductIcon } from "@/components/ProductIcon";
import { NewsCard } from "@/components/NewsCard";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";

export const dynamic = "force-dynamic";

const steps = [
  { icon: ClipboardList, title: "Apply online", text: "Choose a plan and fill one short form. It takes about five minutes." },
  { icon: PhoneCall, title: "We call you", text: "An advisor confirms your details and answers your questions within a day." },
  { icon: Smartphone, title: "Pay your way", text: "Daily, weekly or monthly premiums by mobile money or at any branch." },
  { icon: ShieldCheck, title: "You're covered", text: "Your policy starts immediately and claims are paid within 7 days." },
];

const testimonials = [
  { quote: "When my shop caught fire, SUSU BOX paid in six days. I reopened before the festive season.", name: "Auntie Comfort", role: "Trader, Kejetia" },
  { quote: "I pay two cedis a day by MoMo and my whole family has health cover. It's that simple.", name: "Ibrahim S.", role: "Taxi driver, Tamale" },
  { quote: "The agent explained everything in Twi. For the first time insurance made sense to me.", name: "Maame Esi", role: "Seamstress, Cape Coast" },
];

export default async function HomePage() {
  const news = (await db.list("news")).slice(0, 3);

  return (
    <>
      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-48 -top-32 h-[40rem] w-[40rem] rounded-full bg-gold-200/40 blur-3xl" />
        <div className="container-x relative grid items-center gap-16 pb-24 pt-10 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          <div>
            <span className="eyebrow animate-rise">Licensed insurer · Since 2012</span>
            <h1 className="mt-6 animate-rise text-[3.4rem] font-medium leading-[0.98] text-forest-950 [animation-delay:80ms] sm:text-7xl xl:text-[5.6rem]">
              Small contributions.
              <br />
              <em className="relative font-normal text-forest-600">
                Big
                <svg viewBox="0 0 200 20" className="absolute -bottom-2 left-0 w-full text-gold-500" aria-hidden>
                  <path d="M3 14 C 50 3, 120 3, 197 12" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                </svg>
              </em>{" "}
              protection.
            </h1>
            <p className="mt-8 max-w-xl animate-rise text-lg leading-relaxed text-muted [animation-delay:160ms]">
              SUSU BOX brings the trust of the traditional susu to modern insurance. Cover your health, family,
              car and business from as little as <strong className="text-forest-900">GH₵ 1 a day</strong>.
            </p>
            <div className="mt-10 flex animate-rise flex-wrap gap-3 [animation-delay:240ms]">
              <Link href="/apply" className="btn btn-primary">
                Get covered today <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/insurance" className="btn btn-ghost">
                Explore plans
              </Link>
            </div>
            <div className="mt-12 flex animate-rise items-center gap-5 [animation-delay:320ms]">
              <div className="flex -space-x-3">
                {["AM", "KA", "EO", "YD"].map((i, n) => (
                  <span
                    key={i}
                    className={`grid h-11 w-11 place-items-center rounded-full border-2 border-cream text-xs font-semibold text-cream ${
                      ["bg-forest-700", "bg-gold-600", "bg-clay-500", "bg-forest-900"][n]
                    }`}
                  >
                    {i}
                  </span>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex gap-0.5 text-gold-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-1 text-muted">
                  Trusted by <strong className="text-forest-900">48,000+</strong> Ghanaians
                </p>
              </div>
            </div>
          </div>

          {/* Artistic composition */}
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md animate-rise [animation-delay:200ms] lg:max-w-none">
            <div className="kente absolute inset-x-6 bottom-0 top-10 rounded-t-[12rem] rounded-b-[2.5rem] shadow-2xl grain" />
            <div className="absolute inset-x-16 bottom-10 top-24 rounded-t-[10rem] rounded-b-[2rem] bg-gradient-to-b from-forest-700 to-forest-950" />
            <div className="absolute left-1/2 top-[40%] -translate-x-1/2 text-center text-cream sm:top-[34%]">
              <p className="font-display text-[5rem] font-light italic leading-none text-gold-400 sm:text-[7rem]">₵1</p>
              <p className="mt-1 whitespace-nowrap text-[10px] uppercase tracking-[0.25em] text-cream/60 sm:text-xs sm:tracking-[0.3em]">a day starts it all</p>
            </div>

            <div className="absolute left-0 top-0 w-44 animate-float rounded-2xl bg-white p-3 shadow-xl [--r:-4deg] sm:-left-8 sm:top-16 sm:w-56 sm:p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-forest-50 text-forest-700">
                  <BadgeCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted">Claim approved</p>
                  <p className="font-display text-lg font-semibold text-forest-950">GH₵ 4,500</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-forest-50">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-forest-600 to-gold-500" />
              </div>
              <p className="mt-2 text-[11px] text-muted">Paid to MoMo in 3 days</p>
            </div>

            <div className="absolute bottom-2 right-0 w-44 animate-float rounded-2xl bg-forest-950 p-3 text-cream shadow-xl [--r:3deg] [animation-delay:1.5s] sm:-right-6 sm:bottom-24 sm:w-52 sm:p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-cream/50">Family Health</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="font-display text-3xl">₵2<span className="text-sm text-cream/60">/day</span></p>
                <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-forest-950">ACTIVE</span>
              </div>
              <div className="mt-3 flex gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className={`h-6 flex-1 rounded ${i < 6 ? "bg-gold-400" : "bg-cream/15"}`} />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-cream/50">6 of 7 days paid this week</p>
            </div>

            <div className="absolute right-2 top-6 grid h-14 w-14 sm:right-8 sm:top-4 sm:h-20 sm:w-20 animate-float place-items-center rounded-full bg-gold-500 font-display text-2xl font-semibold text-forest-950 shadow-lg [animation-delay:.8s]">
              ₵
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Marquee ───────────── */}
      <section className="overflow-hidden border-y border-forest-900/10 bg-forest-950 py-5 text-cream">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["Health Cover", "Life & Funeral", "Motor Insurance", "Home & Shop", "Mobile Money Payments", "Claims in 7 Days", "Agents in 16 Regions"].map((w) => (
              <span key={`${k}-${w}`} className="flex items-center gap-12 font-display text-2xl italic">
                {w} <span className="text-gold-500">✦</span>
              </span>
            )),
          )}
        </div>
      </section>

      {/* ───────────── Products ───────────── */}
      <section className="container-x py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <span className="eyebrow">What we cover</span>
            <h2 className="mt-4 max-w-xl text-4xl font-medium leading-tight text-forest-950 md:text-6xl">
              Insurance for the life you&apos;re <em className="text-forest-600">building</em>.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <Link href="/insurance" className="btn btn-ghost">
              All insurance plans <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={i * 90}>
              <Link
                href={`/apply?product=${p.slug}`}
                className={`group relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[2rem] p-7 transition-all duration-500 hover:-translate-y-2 ${
                  i === 1 ? "bg-forest-900 text-cream" : "card"
                }`}
              >
                <span
                  className={`grid h-14 w-14 place-items-center rounded-2xl transition-transform duration-500 group-hover:rotate-[-8deg] ${
                    i === 1 ? "bg-gold-500 text-forest-950" : "bg-forest-50 text-forest-700"
                  }`}
                >
                  <ProductIcon name={p.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-8 text-2xl font-medium">{p.name}</h3>
                <p className={`mt-3 text-sm leading-relaxed ${i === 1 ? "text-cream/70" : "text-muted"}`}>{p.summary}</p>
                <div className="mt-auto flex items-end justify-between pt-8">
                  <div>
                    <p className={`text-[11px] uppercase tracking-[0.18em] ${i === 1 ? "text-cream/50" : "text-muted"}`}>From</p>
                    <p className="font-display text-2xl">{p.from}</p>
                  </div>
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-full transition duration-500 group-hover:rotate-45 ${
                      i === 1 ? "bg-cream text-forest-950" : "bg-forest-900 text-cream"
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────── Stats ───────────── */}
      <section className="relative overflow-hidden bg-forest-900 py-24 text-cream grain">
        <div className="kente absolute inset-0 opacity-[0.12]" />
        <div className="container-x relative grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 100}>
              <div className="border-l border-gold-500/40 pl-6">
                <p className="whitespace-nowrap font-display text-5xl font-light text-gold-400 xl:text-6xl">{s.value}</p>
                <p className="mt-3 text-sm uppercase tracking-[0.18em] text-cream/60">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────── Story teaser ───────────── */}
      <section className="container-x grid gap-16 py-28 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div className="relative">
            <div className="aspect-[5/6] overflow-hidden rounded-[2.5rem] bg-sand">
              <div className="relative flex h-full flex-col justify-end p-10">
                <div className="kente absolute inset-0 opacity-90 [mask-image:linear-gradient(to_bottom,black_20%,transparent_75%)]" />
                <p className="relative font-display text-[9rem] font-light leading-none text-forest-950">2012</p>
                <p className="relative mt-2 max-w-xs text-muted">The year a single savings box in Makola Market started it all.</p>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-4 w-60 rounded-3xl bg-gold-500 p-6 text-forest-950 shadow-xl md:-right-10">
              <p className="font-display text-4xl font-semibold">12+</p>
              <p className="mt-1 text-sm font-medium">years protecting families, traders and drivers</p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <span className="eyebrow">Our story</span>
          <h2 className="mt-4 text-4xl font-medium leading-tight text-forest-950 md:text-5xl">
            Born in the market. <em className="text-forest-600">Built on trust.</em>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            We started as a susu group helping traders save for hard days. Members asked for more than savings, so
            we became an insurer, keeping the daily-contribution habit that made the susu work.
          </p>
          <ol className="mt-10 space-y-6">
            {timeline.slice(0, 3).map((t) => (
              <li key={t.year} className="flex gap-6">
                <span className="w-16 shrink-0 font-display text-2xl text-gold-600">{t.year}</span>
                <div className="border-l border-forest-900/10 pl-6">
                  <p className="font-semibold text-forest-950">{t.title}</p>
                  <p className="mt-1 text-sm text-muted">{t.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/about" className="btn btn-primary mt-10">
            Read our full story <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      {/* ───────────── How it works ───────────── */}
      <section className="bg-sand py-28">
        <div className="container-x">
          <Reveal className="text-center">
            <span className="eyebrow">How it works</span>
            <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-medium leading-tight text-forest-950 md:text-5xl">
              Covered in four simple steps
            </h2>
          </Reveal>
          <div className="relative mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-0 right-0 top-10 hidden border-t-2 border-dashed border-forest-900/15 lg:block" />
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="relative text-center">
                  <span className="relative mx-auto grid h-20 w-20 place-items-center rounded-full border-8 border-sand bg-forest-900 text-gold-400">
                    <s.icon className="h-7 w-7" />
                    <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-gold-500 text-xs font-bold text-forest-950">
                      {i + 1}
                    </span>
                  </span>
                  <h3 className="mt-6 text-2xl font-medium text-forest-950">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-muted">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── News ───────────── */}
      {news.length > 0 && (
        <section className="container-x py-28">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Reveal>
              <span className="eyebrow">Newsroom</span>
              <h2 className="mt-4 text-4xl font-medium leading-tight text-forest-950 md:text-5xl">Latest from SUSU BOX</h2>
            </Reveal>
            <Link href="/news" className="btn btn-ghost">
              All news <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {news.map((n, i) => (
              <Reveal key={n.id} delay={i * 100}>
                <NewsCard item={n} index={i} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ───────────── Testimonials ───────────── */}
      <section className="container-x pb-4 pt-8">
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="card flex h-full flex-col p-8">
                <span className="font-display text-7xl leading-none text-gold-500">&ldquo;</span>
                <blockquote className="-mt-4 font-display text-xl leading-snug text-forest-950">{t.quote}</blockquote>
                <figcaption className="mt-auto flex items-center gap-3 pt-8">
                  <CircleCheck className="h-5 w-5 text-forest-600" />
                  <span>
                    <span className="block text-sm font-semibold text-forest-950">{t.name}</span>
                    <span className="block text-xs text-muted">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
