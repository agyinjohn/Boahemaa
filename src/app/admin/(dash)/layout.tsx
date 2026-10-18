import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const pending = (await db.list("applications")).filter((a) => a.status === "Pending").length;
  return (
    <div className="min-h-screen bg-sand/60">
      <AdminNav pending={pending} />
      <main className="p-5 md:p-10 lg:ml-72">{children}</main>
    </div>
  );
}
