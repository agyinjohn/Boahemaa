import { Link2, CirclePlay, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { deleteVideo } from "@/app/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { VideoForm } from "@/components/admin/VideoForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export default async function AdminVideosPage() {
  const videos = await db.list("videos");
  return (
    <>
      <AdminHeader title="Videos" subtitle="Videos appear on the website's Videos page, newest first." />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <VideoForm />
        <section>
          <h2 className="mb-4 text-xl font-medium text-forest-950">Library ({videos.length})</h2>
          <ul className="space-y-3">
            {videos.map((v) => (
              <li key={v.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-forest-950">
                  {v.youtubeId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <video src={v.file} preload="metadata" muted className="h-full w-full object-cover" />
                  )}
                  <CirclePlay className="absolute inset-0 m-auto h-6 w-6 text-cream drop-shadow" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-forest-950">{v.title}</p>
                  <p className="flex items-center gap-1 text-xs text-muted">
                    {v.youtubeId ? <><Link2 className="h-3.5 w-3.5" /> YouTube</> : "Uploaded file"} · {formatDate(v.createdAt)}
                  </p>
                </div>
                <form action={deleteVideo}>
                  <input type="hidden" name="id" value={v.id} />
                  <ConfirmButton message={`Delete "${v.title}"?`} className="grid h-9 w-9 place-items-center rounded-full text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </ConfirmButton>
                </form>
              </li>
            ))}
            {videos.length === 0 && <li className="rounded-2xl bg-white p-8 text-center text-muted">No videos yet.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
