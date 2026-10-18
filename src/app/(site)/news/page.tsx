import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageHero } from "@/components/PageHero";
import { NewsCard, NewsCover } from "@/components/NewsCard";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "News" };
export const dynamic = "force-dynamic";

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const all = await db.list("news");
  const categories = [...new Set(all.map((n) => n.category))];
  const items = category ? all.filter((n) => n.category === category) : all;
  const [featured, ...rest] = items;

  return (
    <>
      <PageHero
        eyebrow="Newsroom"
        title={<>Stories, updates & <em className="text-forest-600">announcements</em>.</>}
        intro="Company news, community programmes and helpful guides from the SUSU BOX team."
      >
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {[undefined, ...categories].map((c) => (
              <Link
                key={c ?? "all"}
                href={c ? `/news?category=${encodeURIComponent(c)}` : "/news"}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  c === category ? "bg-forest-900 text-cream" : "border border-forest-900/15 text-forest-900 hover:border-forest-900"
                }`}
              >
                {c ?? "All"}
              </Link>
            ))}
          </div>
        )}
      </PageHero>

      <section className="container-x pb-28">
        {!featured ? (
          <div className="card grid place-items-center px-6 py-24 text-center">
            <Newspaper className="h-10 w-10 text-gold-500" />
            <p className="mt-4 font-display text-2xl text-forest-950">No stories yet</p>
            <p className="mt-2 text-muted">Check back soon for news from SUSU BOX.</p>
          </div>
        ) : (
          <>
            <Reveal>
              <Link href={`/news/${featured.id}`} className="group grid overflow-hidden rounded-[2.5rem] bg-forest-950 text-cream lg:grid-cols-2">
                <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[28rem]">
                  <NewsCover item={featured} className="transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-col justify-center p-10 md:p-14">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                    Featured · {featured.category} · {formatDate(featured.createdAt)}
                  </p>
                  <h2 className="mt-5 text-4xl font-medium leading-tight md:text-5xl">{featured.title}</h2>
                  <p className="mt-5 text-cream/70">{featured.excerpt}</p>
                  <span className="mt-8 inline-flex items-center gap-2 font-semibold text-gold-400">
                    Read story <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
            {rest.length > 0 && (
              <div className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((n, i) => (
                  <Reveal key={n.id} delay={(i % 3) * 100}>
                    <NewsCard item={n} index={i + 1} />
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
