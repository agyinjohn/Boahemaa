import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { optimizedImage } from "@/lib/format";
import { deleteTeamMember } from "@/app/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { OrderButtons } from "@/components/admin/OrderButtons";

const initials = (name: string) => name.split(" ").map((n) => n[0]).slice(0, 2).join("");

export default async function AdminTeamPage() {
  const team = await db.list("team");
  return (
    <>
      <AdminHeader title="Team" subtitle="The people shown on the website's Our People page, in this order." />
      <Link href="/admin/team/new" className="btn btn-primary mb-6"><Plus className="h-4 w-4" /> Add team member</Link>
      {team.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center text-muted shadow-sm">No team members yet.</div>
      ) : (
        <ul className="space-y-3">
          {team.map((m, i) => (
            <li key={m.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 pr-4 shadow-sm">
              <OrderButtons kind="team" id={m.id} first={i === 0} last={i === team.length - 1} />
              <div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-forest-700 to-forest-950">
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={optimizedImage(m.photo, 120)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full place-items-center font-display text-lg italic text-cream/80">{initials(m.name)}</span>
                )}
              </div>
              <Link href={`/admin/team/${m.id}`} className="min-w-0 flex-1">
                <p className="truncate font-semibold text-forest-950 hover:text-forest-600">{m.name}</p>
                <p className="truncate text-sm text-muted">{m.role}</p>
              </Link>
              <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${m.dept === "Leadership" ? "bg-gold-100 text-gold-600" : "bg-forest-50 text-forest-800"}`}>{m.dept}</span>
              {!m.photo && <span className="hidden rounded-full bg-sand px-2.5 py-1 text-xs text-muted md:inline">No photo</span>}
              <Link href={`/admin/team/${m.id}`} className="grid h-9 w-9 place-items-center rounded-full text-forest-700 hover:bg-sand" aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </Link>
              <form action={deleteTeamMember}>
                <input type="hidden" name="id" value={m.id} />
                <ConfirmButton message={`Remove ${m.name} from the team page?`} className="grid h-9 w-9 place-items-center rounded-full text-red-700 hover:bg-red-50">
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
