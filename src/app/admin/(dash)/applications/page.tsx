import Link from "next/link";
import { FileText, Mail, MapPin, MessageSquare, Phone, Trash2 } from "lucide-react";
import { db, type ApplicationStatus } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { deleteApplication, resendPaymentLink, setApplicationStatus } from "@/app/actions";
import { cedis } from "@/lib/site";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

function PaymentBadge({ paid }: { paid: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paid ? "bg-forest-900 text-gold-400" : "bg-sand text-muted"}`}>
      {paid ? "Paid" : "Unpaid"}
    </span>
  );
}

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
                <PaymentBadge paid={!!a.payment} />
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
                  <div className="sm:col-span-2 lg:col-span-3 rounded-2xl bg-sand/60 p-4">
                    <dt className="text-xs uppercase tracking-wider text-muted">First premium</dt>
                    {a.payment ? (
                      <dd className="mt-1">
                        <strong className="text-forest-700">{cedis(a.payment.amount)} paid</strong> by {a.payment.channel === "mobile_money" ? "Mobile Money" : a.payment.channel} on {formatDate(a.payment.paidAt)}
                        <span className="ml-2 font-mono text-xs text-muted">{a.payment.reference}</span>
                      </dd>
                    ) : (
                      <dd className="mt-1 flex flex-wrap items-center gap-3">
                        <span><strong className="text-gold-600">{cedis(a.amount ?? 0)} not paid yet</strong></span>
                        <form action={resendPaymentLink}>
                          <input type="hidden" name="id" value={a.id} />
                          <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:underline">
                            <MessageSquare className="h-4 w-4" /> Resend payment link by SMS
                          </button>
                        </form>
                      </dd>
                    )}
                  </div>
                  {a.message && (
                    <div className="sm:col-span-2 lg:col-span-3"><dt className="text-xs uppercase tracking-wider text-muted">Message</dt><dd className="mt-1 whitespace-pre-line">{a.message}</dd></div>
                  )}
                  {a.document && (
                    <a href={`/admin/documents/${encodeURIComponent(a.document)}`} target="_blank" className="inline-flex items-center gap-2 font-semibold text-forest-700 hover:underline">
                      <FileText className="h-4 w-4" /> View ID document
                    </a>
                  )}
                </dl>
                <div className="flex flex-wrap items-start gap-2 md:flex-col md:items-stretch">
                  <form key={a.status} action={setApplicationStatus} className="flex gap-2">
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
