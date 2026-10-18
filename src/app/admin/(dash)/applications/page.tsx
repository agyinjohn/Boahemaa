import Link from "next/link";
import { FileText, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { db, type ApplicationStatus } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { deleteApplication, setApplicationStatus } from "@/app/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

const STATUSES: ApplicationStatus[] = ["Pending", "Under Review", "Approved", "Rejected"];

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const all = await db.list("applications");
  const items = status ? all.filter((a) => a.status === status) : all;

  return (
    <>
      <AdminHeader title="Applications" subtitle="Review insurance applications submitted on the website." />

      <div className="mb-6 flex flex-wrap gap-2">
        {[undefined, ...STATUSES].map((s) => {
          const count = s ? all.filter((a) => a.status === s).length : all.length;
          return (
            <Link
              key={s ?? "all"}
              href={s ? `/admin/applications?status=${encodeURIComponent(s)}` : "/admin/applications"}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                s === status ? "bg-forest-900 text-cream" : "bg-white text-forest-900 hover:bg-forest-50"
              }`}
            >
              {s ?? "All"} <span className="ml-1 opacity-60">{count}</span>
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center text-muted shadow-sm">No applications here yet.</div>
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <details key={a.id} className="group rounded-3xl bg-white shadow-sm open:ring-2 open:ring-gold-200">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-4 p-5 md:p-6">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-forest-900 font-display text-lg text-gold-400">
                  {a.fullName.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-forest-950">{a.fullName}</p>
                  <p className="text-sm text-muted">{a.product} · {a.plan}</p>
                </div>
                <span className="hidden font-mono text-xs text-muted md:block">{a.reference}</span>
                <span className="hidden text-sm text-muted sm:block">{formatDate(a.createdAt)}</span>
                <StatusBadge status={a.status} />
              </summary>
              <div className="grid gap-6 border-t border-forest-900/8 p-5 md:grid-cols-[1fr_auto] md:p-6">
                <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex gap-2"><Phone className="h-4 w-4 text-gold-600" /><a href={`tel:${a.phone}`} className="hover:underline">{a.phone}</a></div>
                  <div className="flex gap-2"><Mail className="h-4 w-4 text-gold-600" />{a.email || "—"}</div>
                  <div className="flex gap-2"><MapPin className="h-4 w-4 text-gold-600" />{a.region}</div>
                  <div><dt className="text-xs uppercase tracking-wider text-muted">Date of birth</dt><dd>{a.dateOfBirth}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wider text-muted">Occupation</dt><dd>{a.occupation || "—"}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wider text-muted">Reference</dt><dd className="font-mono">{a.reference}</dd></div>
                  {a.message && (
                    <div className="sm:col-span-2 lg:col-span-3"><dt className="text-xs uppercase tracking-wider text-muted">Message</dt><dd className="mt-1 whitespace-pre-line">{a.message}</dd></div>
                  )}
                  {a.document && (
                    <a href={a.document} target="_blank" className="inline-flex items-center gap-2 font-semibold text-forest-700 hover:underline">
                      <FileText className="h-4 w-4" /> View ID document
                    </a>
                  )}
                </dl>
                <div className="flex flex-wrap items-start gap-2 md:flex-col md:items-stretch">
                  <form action={setApplicationStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={a.id} />
                    <select name="status" defaultValue={a.status} className="field py-2">
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <button className="btn btn-primary px-4 py-2">Save</button>
                  </form>
                  <form action={deleteApplication}>
                    <input type="hidden" name="id" value={a.id} />
                    <ConfirmButton message={`Delete ${a.fullName}'s application?`} className="btn w-full px-4 py-2 text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" /> Delete
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
