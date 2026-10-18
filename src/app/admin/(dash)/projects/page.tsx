import Link from "next/link";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { optimizedImage } from "@/lib/format";
import { deleteProject } from "@/app/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { OrderButtons } from "@/components/admin/OrderButtons";

export default async function AdminProjectsPage() {
  const projects = await db.list("projects");
  return (
    <>
      <AdminHeader title="Projects" subtitle="Shown on the website's Projects page in this order. The first one is featured as a wide card." />
      <Link href="/admin/projects/new" className="btn btn-primary mb-6"><Plus className="h-4 w-4" /> Add project</Link>
      {projects.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center text-muted shadow-sm">No projects yet.</div>
      ) : (
        <ul className="space-y-3">
          {projects.map((p, i) => (
            <li key={p.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 pr-4 shadow-sm">
              <OrderButtons kind="projects" id={p.id} first={i === 0} last={i === projects.length - 1} />
              <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-xl bg-forest-800">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={optimizedImage(p.image, 200)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <>
                    <div className="kente absolute inset-0 opacity-40" />
                    <span className="absolute bottom-1 right-2 font-display text-lg italic text-cream/80">{p.year}</span>
                  </>
                )}
              </div>
              <Link href={`/admin/projects/${p.id}`} className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  <span className="truncate font-semibold text-forest-950 hover:text-forest-600">{p.title}</span>
                  {i === 0 && <span className="shrink-0 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase text-forest-950">Featured</span>}
                </p>
                <p className="flex items-center gap-1 truncate text-sm text-muted"><MapPin className="h-3.5 w-3.5 shrink-0" /> {p.place || "—"} · {p.year}</p>
              </Link>
              <span className="hidden rounded-full bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-800 sm:inline">{p.tag}</span>
              <Link href={`/admin/projects/${p.id}`} className="grid h-9 w-9 place-items-center rounded-full text-forest-700 hover:bg-sand" aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </Link>
              <form action={deleteProject}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton message={`Delete "${p.title}"?`} className="grid h-9 w-9 place-items-center rounded-full text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
