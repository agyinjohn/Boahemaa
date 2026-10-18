import type { ApplicationStatus } from "@/lib/db";

const styles: Record<ApplicationStatus, string> = {
  Pending: "bg-gold-100 text-gold-600",
  "Under Review": "bg-sky-100 text-sky-700",
  Approved: "bg-forest-100 text-forest-700",
  Rejected: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>;
}
