import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-gold-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-forest-100 blur-3xl" />
      <div className="container-x relative pb-16 pt-14 md:pb-24 md:pt-20">
        <span className="eyebrow animate-rise">{eyebrow}</span>
        <h1 className="mt-5 max-w-4xl animate-rise text-5xl font-medium leading-[1.02] text-forest-950 [animation-delay:80ms] md:text-7xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl animate-rise text-lg leading-relaxed text-muted [animation-delay:160ms]">{intro}</p>
        )}
        {children && <div className="mt-8 animate-rise [animation-delay:240ms]">{children}</div>}
      </div>
    </section>
  );
}
