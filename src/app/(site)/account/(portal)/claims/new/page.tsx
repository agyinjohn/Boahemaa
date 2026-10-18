import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { customerData, isActivePolicy, requireCustomer } from "@/lib/customer";
import { claimTypesFor } from "@/lib/site";
import { ClaimForm } from "./ClaimForm";

export const metadata: Metadata = { title: "Make a claim", robots: { index: false } };

export default async function NewClaimPage() {
  const phone = await requireCustomer();
  const { applications } = await customerData(phone);
  const policies = applications.filter(isActivePolicy).map((a) => ({
    id: a.id,
    label: `${a.product} · ${a.plan} (${a.reference})`,
    claimTypes: [...claimTypesFor(a.product)],
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-forest-900">
        <ArrowLeft className="h-4 w-4" /> My account
      </Link>
      <h1 className="mt-4 text-4xl font-medium text-forest-950 md:text-5xl">Make a claim</h1>
      <p className="mt-3 text-muted">Tell us what happened. We review most claims within 7 days and pay approved claims to your mobile money.</p>
      {policies.length === 0 ? (
        <p className="card mt-8 p-8 text-muted">You need an active policy (approved and paid) before you can make a claim.</p>
      ) : (
        <ClaimForm policies={policies} />
      )}
    </div>
  );
}
