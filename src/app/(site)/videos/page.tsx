import type { Metadata } from "next";
import { CirclePlay } from "lucide-react";
import { db } from "@/lib/db";
import type { Video } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "Videos" };
export const dynamic = "force-dynamic";

function Player({ video }: { video: Video }) {
  if (video.youtubeId) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
        title={video.title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }
  return <video src={video.file} controls preload="metadata" className="h-full w-full bg-black object-contain" />;
}

export default async function VideosPage() {
  const videos = await db.list("videos");
  const [featured, ...rest] = videos;

  return (
    <>
      <PageHero
        eyebrow="Video gallery"
        title={<>See SUSU BOX <em className="text-forest-600">in action</em>.</>}
        intro="Customer stories, community events and short explainers on how insurance works."
      />
      <section className="container-x pb-28">
        {!featured ? (
          <div className="card grid place-items-center px-6 py-24 text-center">
            <CirclePlay className="h-12 w-12 text-gold-500" />
            <p className="mt-4 font-display text-2xl text-forest-950">Videos are coming soon</p>
            <p className="mt-2 text-muted">Our team is putting together customer stories and explainers.</p>
          </div>
        ) : (
          <>
            <Reveal>
              <div className="overflow-hidden rounded-[2.5rem] bg-forest-950 p-3 shadow-2xl">
                <div className="aspect-video overflow-hidden rounded-[2rem]">
                  <Player video={featured} />
                </div>
                <div className="flex flex-col gap-2 px-6 py-6 text-cream md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gold-400">Latest · {formatDate(featured.createdAt)}</p>
                    <h2 className="mt-2 text-3xl font-medium">{featured.title}</h2>
                  </div>
                  <p className="max-w-md text-sm text-cream/60">{featured.description}</p>
                </div>
              </div>
            </Reveal>
            {rest.length > 0 && (
              <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((v, i) => (
                  <Reveal key={v.id} delay={(i % 3) * 100}>
                    <div className="aspect-video overflow-hidden rounded-3xl bg-forest-950">
                      <Player video={v} />
                    </div>
                    <h3 className="mt-4 text-xl font-medium text-forest-950">{v.title}</h3>
                    <p className="mt-1 text-sm text-muted">{v.description}</p>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
