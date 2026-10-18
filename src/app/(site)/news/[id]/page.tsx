import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { NewsCard, NewsCover } from "@/components/NewsCard";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await db.get("news", (await params).id);
  return { title: item?.title ?? "News", description: item?.excerpt };
}

export default async function NewsArticle({ params }: Props) {
  const { id } = await params;
  const item = await db.get("news", id);
  if (!item) notFound();
  const more = (await db.list("news")).filter((n) => n.id !== id).slice(0, 3);

  return (
    <article>
      <header className="container-x max-w-4xl pb-12 pt-14 text-center">
        <Link href="/news" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-forest-900">
          <ArrowLeft className="h-4 w-4" /> All news
        </Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
          {item.category} · {formatDate(item.createdAt)}
        </p>
        <h1 className="mt-5 text-4xl font-medium leading-[1.05] text-forest-950 md:text-6xl">{item.title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{item.excerpt}</p>
      </header>
      <div className="container-x">
        <div className="aspect-[21/9] overflow-hidden rounded-[2.5rem]">
          <NewsCover item={item} />
        </div>
      </div>
      <div className="container-x max-w-3xl py-16">
        {item.body.split(/\n{2,}/).map((para, i) => (
          <p
            key={i}
            className={`mb-6 text-lg leading-[1.85] text-ink/85 ${
              i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-forest-700" : ""
            }`}
          >
            {para}
          </p>
        ))}
      </div>
      {more.length > 0 && (
        <section className="border-t border-forest-900/10 bg-sand py-20">
          <div className="container-x">
            <h2 className="text-3xl font-medium text-forest-950">More stories</h2>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {more.map((n, i) => (
                <NewsCard key={n.id} item={n} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
