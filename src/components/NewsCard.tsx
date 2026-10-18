import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { News } from "@/lib/db";
import { formatDate } from "@/lib/format";

const tints = ["bg-forest-800", "bg-gold-500", "bg-clay-500", "bg-forest-600"];

export function NewsCover({ item, index = 0, className = "" }: { item: News; index?: number; className?: string }) {
  if (item.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.image} alt="" className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div className={`relative h-full w-full overflow-hidden ${tints[index % tints.length]} ${className}`}>
      <div className="kente absolute inset-0 opacity-30 mix-blend-overlay" />
      <span className="absolute bottom-4 left-5 right-5 truncate font-display text-5xl italic leading-tight text-cream/90">{item.category}</span>
    </div>
  );
}

export function NewsCard({ item, index = 0 }: { item: News; index?: number }) {
  return (
    <Link href={`/news/${item.id}`} className="group flex h-full flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
        <NewsCover item={item} index={index} className="transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-cream text-forest-950 opacity-0 transition duration-500 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-muted">
        <span className="text-gold-600">{item.category}</span>
        <span className="h-1 w-1 rounded-full bg-muted/40" />
        <time>{formatDate(item.createdAt)}</time>
      </div>
      <h3 className="mt-3 text-2xl font-medium leading-snug text-forest-950 transition-colors group-hover:text-forest-600">
        {item.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{item.excerpt}</p>
    </Link>
  );
}
