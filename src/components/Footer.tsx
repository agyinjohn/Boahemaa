import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Logo } from "./Logo";
import { company, products } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-forest-950 text-cream grain">
      <div className="kente-strip h-2 w-full" />
      <div className="container-x relative grid gap-14 py-20 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream/60">
            From a savings box in Makola Market to a nationwide insurer, still built on the same idea:
            small contributions, big protection.
          </p>
          <p className="mt-6 font-display text-2xl italic text-gold-400">&ldquo;{company.tagline}.&rdquo;</p>
        </div>

        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Insurance</h4>
          <ul className="mt-5 space-y-3 text-sm text-cream/70">
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={`/apply?product=${p.slug}`} className="transition hover:text-gold-400">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Company</h4>
          <ul className="mt-5 space-y-3 text-sm text-cream/70">
            {[
              ["/about", "Our Story"],
              ["/team", "Our People"],
              ["/projects", "Projects"],
              ["/news", "News"],
              ["/videos", "Videos"],
              ["/apply", "Apply Online"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-gold-400">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Get in touch</h4>
          <ul className="mt-5 space-y-4 text-sm text-cream/70">
            <li className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-gold-400" />{company.address}</li>
            <li className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-gold-400" />{company.phone}</li>
            <li className="flex gap-3"><Mail className="h-4 w-4 shrink-0 text-gold-400" />{company.email}</li>
            <li className="flex gap-3"><Clock className="h-4 w-4 shrink-0 text-gold-400" />{company.hours}</li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-cream/10">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-cream/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SUSU BOX Insurance. All rights reserved.</p>
          <p>Licensed by the National Insurance Commission · <Link href="/admin" className="hover:text-gold-400">Staff login</Link></p>
        </div>
      </div>
    </footer>
  );
}
