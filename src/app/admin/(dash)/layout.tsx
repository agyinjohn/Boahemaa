import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [applications, messages, claims] = await Promise.all([db.list("applications"), db.list("messages"), db.list("claims")]);
  const badges = {
    "/admin/applications": applications.filter((a) => a.status === "Pending").length,
    "/admin/messages": messages.filter((m) => !m.read).length,
    "/admin/claims": claims.filter((c) => c.status === "Submitted").length,
  };
  return (
    <div className="min-h-screen bg-sand/60">
      <AdminNav badges={badges} />
      <main className="p-5 md:p-10 lg:ml-72">{children}</main>
    </div>
  );
}
