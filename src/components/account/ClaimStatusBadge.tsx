import type { ClaimStatus } from "@/lib/db";

const styles: Record<ClaimStatus, string> = {
  Submitted: "bg-gold-100 text-gold-600",
  "Under Review": "bg-sky-100 text-sky-700",
  "More Info Needed": "bg-orange-100 text-orange-700",
  Approved: "bg-forest-100 text-forest-700",
  Paid: "bg-forest-900 text-gold-400",
  Rejected: "bg-red-100 text-red-700",
};

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>;
}
