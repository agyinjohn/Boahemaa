import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FilePlus, ShieldCheck } from "lucide-react";
import { customerData, isActivePolicy, requireCustomer } from "@/lib/customer";
import { cedis } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { ClaimStatusBadge } from "@/components/account/ClaimStatusBadge";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

function policyState(a: { status: string; payment?: unknown }) {
  if (isActivePolicy(a)) return { label: "Active", style: "bg-forest-600 text-cream" };
  if (a.status === "Rejected") return { label: "Not approved", style: "bg-red-100 text-red-700" };
  if (!a.payment) return { label: "Awaiting payment", style: "bg-gold-100 text-gold-600" };
  return { label: a.status === "Under Review" ? "Under review" : "Being processed", style: "bg-sky-100 text-sky-700" };
}

export default async function AccountPage() {
  const phone = await requireCustomer();
  const { applications, claims } = await customerData(phone);
  const active = applications.filter(isActivePolicy);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <section>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-4xl font-medium text-forest-950">My policies</h1>
          <Link href="/apply" className="text-sm font-semibold text-forest-700 hover:underline">Get more cover</Link>
        </div>
        {applications.length === 0 ? (
          <div className="card mt-6 p-10 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-gold-500" />
            <p className="mt-4 font-display text-2xl text-forest-950">No policies yet</p>
            <p className="mt-2 text-muted">We couldn&apos;t find any applications for {phone}.</p>
            <Link href="/apply" className="btn btn-primary mt-6">Apply for cover <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {applications.map((a) => {
              const state = policyState(a);
              return (
                <li key={a.id} className="card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">{a.product}</p>
                      <p className="mt-1 font-display text-2xl text-forest-950">{a.plan} plan</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${state.style}`}>{state.label}</span>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                    <div><dt className="text-xs text-muted">Reference</dt><dd className="font-mono">{a.reference}</dd></div>
                    <div><dt className="text-xs text-muted">Premium</dt><dd>{cedis(a.amount ?? 0)} / month</dd></div>
                    <div><dt className="text-xs text-muted">Applied</dt><dd>{formatDate(a.createdAt)}</dd></div>
                  </dl>
                  {!a.payment && a.status !== "Rejected" && (
                    <Link href={`/pay/${a.reference}`} className="btn btn-gold mt-5">Pay {cedis(a.amount ?? 0)} to start cover</Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-4xl font-medium text-forest-950">My claims</h2>
        </div>
        {active.length > 0 ? (
          <Link href="/account/claims/new" className="group mt-6 flex items-center gap-4 rounded-3xl bg-forest-900 p-6 text-cream transition hover:bg-forest-800">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-500 text-forest-950"><FilePlus className="h-6 w-6" /></span>
            <span className="flex-1">
              <span className="block font-display text-xl">Make a claim</span>
              <span className="text-sm text-cream/60">Takes about 3 minutes. Have your photos ready.</span>
            </span>
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
        ) : (
          <p className="mt-6 rounded-3xl bg-sand p-6 text-sm text-muted">
            You can make a claim once you have an <strong>active</strong> policy (approved and paid).
          </p>
        )}
        <ul className="mt-4 space-y-3">
          {claims.map((c) => (
            <li key={c.id}>
              <Link href={`/account/claims/${c.id}`} className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-forest-950">{c.type}</p>
                  <p className="truncate text-xs text-muted">{c.product} · <span className="font-mono">{c.reference}</span> · {formatDate(c.createdAt)}</p>
                </div>
                <ClaimStatusBadge status={c.status} />
              </Link>
            </li>
          ))}
          {claims.length === 0 && active.length > 0 && <li className="px-2 text-sm text-muted">No claims yet.</li>}
        </ul>
      </section>
    </div>
  );
}
