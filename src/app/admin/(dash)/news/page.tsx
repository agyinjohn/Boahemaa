import Link from "next/link";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { deleteNews } from "@/app/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { NewsForm } from "@/components/admin/NewsForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { NewsCover } from "@/components/NewsCard";

export default async function AdminNewsPage() {
  const news = await db.list("news");
  return (
    <>
      <AdminHeader title="News stories" subtitle="Publish stories that appear on the website's News page and home page." />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <NewsForm />
        <section>
          <h2 className="mb-4 text-xl font-medium text-forest-950">Published ({news.length})</h2>
          <ul className="space-y-3">
            {news.map((n, i) => (
              <li key={n.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl"><NewsCover item={n} index={i} className="[&>span]:hidden" /></div>
                <Link href={`/admin/news/${n.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-forest-950 hover:text-forest-600">{n.title}</p>
                  <p className="text-xs text-muted">{n.category} · {formatDate(n.createdAt)}</p>
                </Link>
                <Link href={`/admin/news/${n.id}`} className="grid h-9 w-9 place-items-center rounded-full text-forest-700 hover:bg-sand" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Link>
                <Link href={`/news/${n.id}`} target="_blank" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-sand" aria-label="View">
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <form action={deleteNews}>
                  <input type="hidden" name="id" value={n.id} />
                  <ConfirmButton message={`Delete "${n.title}"?`} className="grid h-9 w-9 place-items-center rounded-full text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </ConfirmButton>
                </form>
              </li>
            ))}
            {news.length === 0 && <li className="rounded-2xl bg-white p-8 text-center text-muted">No stories yet.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
