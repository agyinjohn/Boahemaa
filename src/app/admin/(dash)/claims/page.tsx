import Link from "next/link";
import { FileText, MessageCircle, Phone } from "lucide-react";
import { CLAIM_STATUSES, db } from "@/lib/db";
import { cedis } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ClaimUpdateForm } from "@/components/admin/ClaimUpdateForm";
import { ClaimStatusBadge } from "@/components/account/ClaimStatusBadge";

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function AdminClaimsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const all = await db.list("claims");
  const items = status ? all.filter((c) => c.status === status) : all;
  const paidOut = all.filter((c) => c.status === "Paid").reduce((sum, c) => sum + (c.approvedAmount ?? 0), 0);

  return (
    <>
      <AdminHeader title="Claims" subtitle={`Claims made by customers in their accounts. ${cedis(paidOut)} paid out so far.`} />
      <div className="mb-6 flex flex-wrap gap-2">
        {[undefined, ...CLAIM_STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/claims?status=${encodeURIComponent(s)}` : "/admin/claims"}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${s === status ? "bg-forest-900 text-cream" : "bg-white text-forest-900 hover:bg-forest-50"}`}
          >
            {s ?? "All"} <span className="ml-1 opacity-60">{s ? all.filter((c) => c.status === s).length : all.length}</span>
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center text-muted shadow-sm">No claims here.</div>
      ) : (
        <div className="space-y-4">
          {items.map((c) => (
            <details key={c.id} className="group rounded-3xl bg-white shadow-sm open:ring-2 open:ring-gold-200" open={c.status === "Submitted" && items.length <= 3}>
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-4 p-5 md:p-6">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-forest-900 font-display text-lg text-gold-400">{c.customerName.charAt(0)}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-forest-950">{c.customerName} · {c.type}</p>
                  <p className="text-sm text-muted">{c.product} · {c.plan}{c.amountClaimed ? ` · claims ${cedis(c.amountClaimed)}` : ""}</p>
                </div>
                <span className="hidden font-mono text-xs text-muted md:block">{c.reference}</span>
                <span className="hidden text-sm text-muted sm:block">{formatDate(c.createdAt)}</span>
                <ClaimStatusBadge status={c.status} />
              </summary>
              <div className="grid gap-6 border-t border-forest-900/8 p-5 md:p-6 lg:grid-cols-[1fr_24rem]">
                <div>
                  <dl className="grid gap-4 text-sm sm:grid-cols-3">
                    <div><dt className="text-xs uppercase tracking-wider text-muted">Incident date</dt><dd>{formatDate(c.incidentDate)}</dd></div>
                    <div><dt className="text-xs uppercase tracking-wider text-muted">Policy</dt><dd className="font-mono">{c.policyReference}</dd></div>
                    <div><dt className="text-xs uppercase tracking-wider text-muted">Approved</dt><dd className="font-semibold text-forest-700">{c.approvedAmount ? cedis(c.approvedAmount) : "—"}</dd></div>
                  </dl>
                  <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink/85">{c.description}</p>
                  {c.documents.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {c.documents.map((d, i) => (
                        <a key={d} href={`/admin/documents/${encodeURIComponent(d)}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-3 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-100">
                          <FileText className="h-3.5 w-3.5" /> Document {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a href={`tel:${c.phone}`} className="btn btn-ghost px-4 py-2"><Phone className="h-4 w-4" /> {c.phone}</a>
                    <a href={`https://wa.me/233${c.phone.replace(/^0/, "")}`} target="_blank" rel="noreferrer" className="btn btn-ghost px-4 py-2"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
                  </div>
                  <ol className="mt-6 space-y-3 border-l-2 border-forest-900/10 pl-5">
                    {c.history.map((h, i) => (
                      <li key={i} className="relative text-sm">
                        <span className="absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-gold-500" />
                        <span className="font-semibold text-forest-950">{h.status}</span> <span className="text-xs text-muted">· {when(h.at)}</span>
                        {h.note && <p className="mt-1 text-ink/80">{h.note}</p>}
                      </li>
                    ))}
                  </ol>
                </div>
                <ClaimUpdateForm key={c.id} id={c.id} status={c.status} approvedAmount={c.approvedAmount} />
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
