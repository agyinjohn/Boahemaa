import { Trash2 } from "lucide-react";
import { getTeamPhotos } from "@/lib/db";
import { team } from "@/lib/site";
import { removeTeamPhoto } from "@/app/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { TeamPhotoForm } from "@/components/admin/TeamPhotoForm";

const initials = (name: string) => name.split(" ").map((n) => n[0]).slice(0, 2).join("");

export default async function AdminTeamPage() {
  const photos = await getTeamPhotos();
  return (
    <>
      <AdminHeader
        title="Team photos"
        subtitle="Upload a photo for each team member. Square or portrait photos (at least 600px wide) look best."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {team.map((m) => (
          <div key={m.slug} className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="relative aspect-[4/5] bg-gradient-to-br from-forest-700 to-forest-950">
              {photos[m.slug] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[m.slug]} alt={m.name} className="h-full w-full object-cover" />
              ) : (
                <span className="absolute inset-0 grid place-items-center font-display text-6xl italic text-cream/80">{initials(m.name)}</span>
              )}
              {!photos[m.slug] && (
                <span className="absolute left-3 top-3 rounded-full bg-gold-500 px-2.5 py-1 text-[11px] font-bold text-forest-950">No photo</span>
              )}
            </div>
            <div className="p-5">
              <p className="font-semibold text-forest-950">{m.name}</p>
              <p className="text-sm text-muted">{m.role}</p>
              <div className="mt-4 flex items-center gap-2">
                <TeamPhotoForm slug={m.slug} hasPhoto={!!photos[m.slug]} />
                {photos[m.slug] && (
                  <form action={removeTeamPhoto}>
                    <input type="hidden" name="slug" value={m.slug} />
                    <ConfirmButton message={`Remove ${m.name}'s photo?`} className="grid h-9 w-9 place-items-center rounded-full text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </ConfirmButton>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
