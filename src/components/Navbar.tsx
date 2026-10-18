"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Our Story" },
  { href: "/insurance", label: "Insurance" },
  { href: "/team", label: "Our People" },
  { href: "/projects", label: "Projects" },
  { href: "/news", label: "News" },
  { href: "/videos", label: "Videos" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-forest-900/8 bg-cream/85 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="kente-strip h-1.5 w-full" />
      <nav className="container-x flex h-20 items-center justify-between gap-6">
        <Logo />
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive(l.href) ? "text-forest-950" : "text-muted hover:text-forest-900"
                }`}
              >
                {l.label}
                {isActive(l.href) && (
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-gold-500" />
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link href="/apply" className="btn btn-primary hidden sm:inline-flex">
            Apply now <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-11 w-11 place-items-center rounded-full border border-forest-900/15 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-forest-900/8 bg-cream lg:hidden">
          <ul className="container-x flex flex-col py-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`flex items-center justify-between border-b border-forest-900/6 py-4 font-display text-2xl ${
                    isActive(l.href) ? "text-gold-600" : "text-forest-950"
                  }`}
                >
                  {l.label}
                  <ArrowUpRight className="h-5 w-5 opacity-40" />
                </Link>
              </li>
            ))}
            <li className="pt-5">
              <Link href="/apply" className="btn btn-gold w-full">
                Apply for cover
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
