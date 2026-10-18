import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, CircleCheck, Paperclip, Phone } from "lucide-react";
import { db, type ClaimStatus } from "@/lib/db";
import { requireCustomer } from "@/lib/customer";
import { cedis, company } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { ClaimStatusBadge } from "@/components/account/ClaimStatusBadge";

export const metadata: Metadata = { title: "Claim", robots: { index: false } };

const steps: ClaimStatus[] = ["Submitted", "Under Review", "Approved", "Paid"];
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function ClaimPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const phone = await requireCustomer();
  const claim = await db.get("claims", (await params).id);
  if (!claim || claim.phone !== phone) notFound();
  const justSubmitted = (await searchParams).new === "1";

  // Where the claim is on the happy path (More Info Needed sits at "Under Review").
  const reached = claim.status === "More Info Needed" ? 1 : steps.indexOf(claim.status);
  const notes = claim.history.filter((h) => h.note);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-forest-900">
        <ArrowLeft className="h-4 w-4" /> My account
      </Link>
      {justSubmitted && (
        <p className="mt-6 flex items-center gap-3 rounded-2xl bg-forest-600 px-5 py-4 text-cream">
          <CircleCheck className="h-5 w-5 shrink-0" /> Claim submitted. We&apos;ve sent you an SMS and will review it within 7 days.
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-muted">{claim.reference}</p>
          <h1 className="mt-1 text-4xl font-medium text-forest-950">{claim.type}</h1>
          <p className="mt-1 text-muted">{claim.product} · {claim.plan} · policy {claim.policyReference}</p>
        </div>
        <ClaimStatusBadge status={claim.status} />
      </div>

      {claim.status === "Rejected" ? (
        <p className="mt-8 rounded-3xl bg-red-50 p-6 text-sm text-red-800">This claim was not approved. See the note from our team below, or call us on {company.phone}.</p>
      ) : (
        <ol className="card mt-8 grid grid-cols-4 gap-2 p-6">
          {steps.map((s, i) => (
            <li key={s} className="text-center">
              <span className={`mx-auto grid h-10 w-10 place-items-center rounded-full text-sm font-semibold ${i <= reached ? "bg-forest-600 text-cream" : "bg-sand text-muted"} ${i === reached ? "ring-4 ring-gold-200" : ""}`}>
                {i < reached || claim.status === "Paid" ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <p className={`mt-2 text-xs font-medium sm:text-sm ${i <= reached ? "text-forest-950" : "text-muted"}`}>{s}</p>
            </li>
          ))}
        </ol>
      )}

      {claim.status === "More Info Needed" && (
        <div className="mt-6 rounded-3xl border border-orange-200 bg-orange-50 p-6 text-sm text-orange-900">
          <p className="font-semibold">We need a little more information.</p>
          <p className="mt-1">Please read the note below and call or WhatsApp us on {company.whatsapp} with the details.</p>
        </div>
      )}

      {notes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-medium text-forest-950">Messages from SUSU BOX</h2>
          <ul className="mt-4 space-y-3">
            {notes.map((h, i) => (
              <li key={i} className="card p-5">
                <div className="flex items-center justify-between gap-3 text-xs text-muted">
                  <ClaimStatusBadge status={h.status} />
                  <span>{when(h.at)}</span>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-ink/85">{h.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card mt-8 p-6">
        <h2 className="text-2xl font-medium text-forest-950">Claim details</h2>
        <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-3">
          <div><dt className="text-xs text-muted">Date of incident</dt><dd>{formatDate(claim.incidentDate)}</dd></div>
          <div><dt className="text-xs text-muted">Amount claimed</dt><dd>{claim.amountClaimed ? cedis(claim.amountClaimed) : "—"}</dd></div>
          <div><dt className="text-xs text-muted">Amount approved</dt><dd className="font-semibold text-forest-700">{claim.approvedAmount ? cedis(claim.approvedAmount) : "—"}</dd></div>
        </dl>
        <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink/85">{claim.description}</p>
        <p className="mt-5 flex items-center gap-2 text-sm text-muted"><Paperclip className="h-4 w-4" /> {claim.documents.length} document{claim.documents.length === 1 ? "" : "s"} attached</p>
      </section>

      <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted">
        <Phone className="h-4 w-4" /> Questions about this claim? Call {company.phone}
      </p>
    </div>
  );
}
