import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";
import { team } from "@/lib/site";
import { getTeamPhotos } from "@/lib/db";

export const metadata: Metadata = { title: "Our People" };
export const dynamic = "force-dynamic";

const palettes = [
  "from-forest-700 to-forest-950",
  "from-gold-400 to-gold-600",
  "from-clay-500 to-forest-900",
  "from-forest-600 to-forest-800",
];

const initials = (name: string) => name.split(" ").map((n) => n[0]).slice(0, 2).join("");

export default async function TeamPage() {
  const photos = await getTeamPhotos();
  const leaders = team.filter((t) => t.dept === "Leadership");
  const staff = team.filter((t) => t.dept !== "Leadership");

  return (
    <>
      <PageHero
        eyebrow="Our people"
        title={<>The faces behind <em className="text-forest-600">every promise</em>.</>}
        intro="Over 200 staff and 600 field agents across Ghana work every day to keep families and businesses protected."
      />

      <section className="container-x pb-20">
        <Reveal>
          <h2 className="text-3xl font-medium text-forest-950">Leadership</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {leaders.map((p, i) => (
            <Reveal key={p.name} delay={i * 100}>
              <article className="group">
                <div className={`relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-br ${palettes[i % palettes.length]}`}>
                  <div className="kente absolute inset-0 opacity-20 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-40" />
                  {photos[p.slug] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photos[p.slug]} alt={p.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center font-display text-[8rem] font-light italic text-cream/90 transition-transform duration-700 group-hover:scale-110">
                      {initials(p.name)}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-forest-950/50 to-transparent" />
                  <span className="absolute bottom-5 left-5 rounded-full bg-cream/90 px-3 py-1 text-xs font-semibold text-forest-950">{p.dept}</span>
                </div>
                <h3 className="mt-6 text-2xl font-medium text-forest-950">{p.name}</h3>
                <p className="text-sm font-semibold text-gold-600">{p.role}</p>
                <p className="mt-2 text-sm text-muted">{p.bio}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-sand py-20">
        <div className="container-x">
          <Reveal>
            <h2 className="text-3xl font-medium text-forest-950">Our team</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {staff.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <article className="card h-full p-6 text-center">
                  {photos[p.slug] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photos[p.slug]} alt={p.name} className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-gold-200" />
                  ) : (
                    <span className={`mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br font-display text-3xl italic text-cream ${palettes[(i + 1) % palettes.length]}`}>
                      {initials(p.name)}
                    </span>
                  )}
                  <h3 className="mt-5 text-lg font-medium text-forest-950">{p.name}</h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">{p.role}</p>
                  <p className="mt-3 text-sm text-muted">{p.bio}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
