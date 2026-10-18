import Link from "next/link";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  // A money box with a coin dropping into the slot: the "susu box".
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="4" y="14" width="40" height="30" rx="9" fill="#0b3326" />
      <path d="M4 30h40" stroke="#d99a2b" strokeWidth="2.5" />
      <path d="M4 35h40" stroke="#c4553a" strokeWidth="1.5" opacity=".8" />
      <rect x="17" y="19" width="14" height="3" rx="1.5" fill="#fbf7ef" />
      <circle cx="24" cy="10" r="7" fill="#d99a2b" />
      <path d="M24 6.5v7M21.5 8.5h3.75a1.75 1.75 0 0 1 0 3.5H22" stroke="#0b3326" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="SUSU BOX home">
      <LogoMark className="h-10 w-10 transition-transform duration-500 group-hover:-rotate-6" />
      <span className="leading-none">
        <span className={`block font-display text-xl font-semibold tracking-tight ${light ? "text-cream" : "text-forest-950"}`}>
          SUSU<span className="text-gold-500"> BOX</span>
        </span>
        <span className={`mt-1 block text-[10px] font-medium uppercase tracking-[0.25em] ${light ? "text-cream/60" : "text-muted"}`}>
          Insurance
        </span>
      </span>
    </Link>
  );
}
