import Link from "next/link";
import { ArrowUpRight, ClipboardList, Clock, Newspaper, CirclePlay } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AdminHome() {
  const [applications, news, videos] = await Promise.all([db.list("applications"), db.list("news"), db.list("videos")]);
  const pending = applications.filter((a) => a.status === "Pending").length;

  const cards = [
    { label: "Applications", value: applications.length, icon: ClipboardList, href: "/admin/applications", tone: "bg-forest-900 text-cream" },
    { label: "Awaiting review", value: pending, icon: Clock, href: "/admin/applications?status=Pending", tone: "bg-gold-500 text-forest-950" },
    { label: "News stories", value: news.length, icon: Newspaper, href: "/admin/news", tone: "bg-white" },
    { label: "Videos", value: videos.length, icon: CirclePlay, href: "/admin/videos", tone: "bg-white" },
  ];

  return (
    <>
      <AdminHeader title="Akwaaba 👋" subtitle="Here's what's happening at SUSU BOX today." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={`group rounded-3xl p-6 shadow-sm transition hover:-translate-y-1 ${c.tone}`}>
            <div className="flex items-center justify-between">
              <c.icon className="h-5 w-5 opacity-70" />
              <ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-70" />
            </div>
            <p className="mt-8 font-display text-5xl font-light">{c.value}</p>
            <p className="mt-1 text-sm opacity-70">{c.label}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium text-forest-950">Recent applications</h2>
          <Link href="/admin/applications" className="text-sm font-semibold text-forest-700 hover:underline">View all</Link>
        </div>
        {applications.length === 0 ? (
          <p className="mt-6 text-muted">No applications yet. They will appear here when customers apply on the website.</p>
        ) : (
          <ul className="mt-6 divide-y divide-forest-900/8">
            {applications.slice(0, 6).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-semibold text-forest-950">{a.fullName}</p>
                  <p className="text-sm text-muted">{a.product} · {a.plan} · {formatDate(a.createdAt)}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link href="/admin/news" className="kente relative overflow-hidden rounded-3xl p-8 text-cream">
          <div className="absolute inset-0 bg-forest-950/70" />
          <div className="relative">
            <Newspaper className="h-6 w-6 text-gold-400" />
            <p className="mt-6 font-display text-2xl">Publish a news story</p>
            <p className="mt-1 text-sm text-cream/70">Share company updates and community stories.</p>
          </div>
        </Link>
        <Link href="/admin/videos" className="relative overflow-hidden rounded-3xl bg-gold-500 p-8 text-forest-950">
          <CirclePlay className="h-6 w-6" />
          <p className="mt-6 font-display text-2xl">Add a video</p>
          <p className="mt-1 text-sm text-forest-950/70">Paste a YouTube link or upload a video file.</p>
        </Link>
      </div>
    </>
  );
}
