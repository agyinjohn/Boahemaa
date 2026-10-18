import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { optimizedImage } from "@/lib/format";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

const tones = ["bg-forest-900", "bg-gold-500", "bg-clay-500", "bg-forest-700", "bg-forest-950", "bg-gold-600"];

export default async function ProjectsPage() {
  const projects = await db.list("projects");
  return (
    <>
      <PageHero
        eyebrow="Projects & community"
        title={<>Protection that starts <em className="text-forest-600">in the community</em>.</>}
        intro="Beyond policies, we invest in programmes that make markets safer, families healthier and futures more secure."
      />
      <section className="container-x grid gap-6 pb-12 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 100} className={i === 0 ? "md:col-span-2 lg:col-span-2" : ""}>
            <article className="group h-full overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_-30px_rgba(23,32,28,0.35)]">
              <div className={`relative overflow-hidden ${i === 0 ? "aspect-[2/1]" : "aspect-[4/3]"} ${tones[i % tones.length]}`}>
                {p.image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={optimizedImage(p.image, i === 0 ? 1400 : 800)} alt={p.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="kente absolute inset-0 opacity-30 mix-blend-overlay transition-transform duration-1000 group-hover:scale-110" />
                )}
                <span className="absolute left-6 top-6 rounded-full bg-cream px-3 py-1 text-xs font-semibold text-forest-950">{p.tag}</span>
                <span className="absolute bottom-4 right-6 font-display text-7xl font-light italic text-cream/80">{p.year}</span>
              </div>
              <div className="p-7">
                {p.place && (
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-muted">
                    <MapPin className="h-3.5 w-3.5 text-gold-600" /> {p.place}
                  </p>
                )}
                <h3 className="mt-3 text-2xl font-medium text-forest-950">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </section>
      <CtaBand />
    </>
  );
}
