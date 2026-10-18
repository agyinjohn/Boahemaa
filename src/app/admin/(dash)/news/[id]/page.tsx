import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { NewsForm } from "@/components/admin/NewsForm";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const item = await db.get("news", (await params).id);
  if (!item) notFound();
  return (
    <>
      <AdminHeader title="Edit story" subtitle={`Published ${formatDate(item.createdAt)}`} />
      <div className="max-w-3xl">
        <NewsForm item={item} />
      </div>
    </>
  );
}
