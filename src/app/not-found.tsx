import Link from "next/link";
import { ArrowRight, House } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Page not found" };

const suggestions = [
  { href: "/insurance", label: "Insurance plans" },
  { href: "/apply", label: "Apply online" },
  { href: "/news", label: "Latest news" },
  { href: "/contact", label: "Contact us" },
];

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-20 h-[30rem] w-[30rem] rounded-full bg-gold-200/40 blur-3xl" />
        <div className="container-x relative grid items-center gap-14 py-20 md:py-28 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Error 404</span>
            <h1 className="mt-5 text-5xl font-medium leading-[1.02] text-forest-950 md:text-7xl">
              This page has gone <em className="text-forest-600">missing</em>.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted">
              The link may be broken, or the page may have moved. Your cover hasn&apos;t gone anywhere, though.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/" className="btn btn-primary"><House className="h-4 w-4" /> Back to home</Link>
              <Link href="/apply" className="btn btn-ghost">Apply for cover</Link>
            </div>
            <ul className="mt-12 grid max-w-md grid-cols-2 gap-x-6 border-t border-forest-900/10 pt-6">
              {suggestions.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="group flex items-center justify-between py-2 text-sm font-medium text-forest-900 hover:text-gold-600">
                    {s.label} <ArrowRight className="h-4 w-4 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* An empty money box with the coin floating away */}
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="kente absolute inset-x-8 bottom-6 top-24 rounded-[3rem] shadow-2xl grain" />
            <div className="absolute inset-x-16 bottom-14 top-32 grid place-items-center rounded-[2.25rem] bg-gradient-to-b from-forest-700 to-forest-950">
              <p className="font-display text-[7rem] font-light italic leading-none text-gold-400 sm:text-[9rem]">404</p>
            </div>
            <div className="absolute left-1/2 top-[6.5rem] h-3 w-28 -translate-x-1/2 rounded-full bg-cream" />
            <div className="absolute right-10 top-0 grid h-20 w-20 animate-float place-items-center rounded-full bg-gold-500 font-display text-3xl font-semibold text-forest-950 shadow-lg [--r:12deg]">
              ₵
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
