"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CirclePlay, ClipboardList, ExternalLink, LayoutDashboard, LogOut, Newspaper, Users } from "lucide-react";
import { logout } from "@/app/actions";
import { LogoMark } from "@/components/Logo";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Applications", icon: ClipboardList },
  { href: "/admin/news", label: "News stories", icon: Newspaper },
  { href: "/admin/videos", label: "Videos", icon: CirclePlay },
  { href: "/admin/team", label: "Team photos", icon: Users },
];

export function AdminNav({ pending }: { pending: number }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <aside className="flex flex-col bg-forest-950 text-cream lg:fixed lg:inset-y-0 lg:w-72">
      <div className="kente-strip h-1.5" />
      <div className="flex items-center gap-3 px-6 py-6">
        <LogoMark className="h-10 w-10" />
        <div>
          <p className="font-display text-lg font-semibold">SUSU<span className="text-gold-400"> BOX</span></p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-cream/50">Staff portal</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:pb-0">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              active(l.href) ? "bg-cream/10 text-gold-400" : "text-cream/70 hover:bg-cream/5 hover:text-cream"
            }`}
          >
            <l.icon className="h-4 w-4" />
            {l.label}
            {l.href === "/admin/applications" && pending > 0 && (
              <span className="ml-auto rounded-full bg-gold-500 px-2 py-0.5 text-[11px] font-bold text-forest-950">{pending}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="hidden space-y-1 border-t border-cream/10 p-3 lg:block">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-cream/70 hover:bg-cream/5">
          <ExternalLink className="h-4 w-4" /> View website
        </Link>
        <form action={logout}>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-cream/70 hover:bg-cream/5">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
