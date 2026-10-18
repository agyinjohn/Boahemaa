import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { TeamForm } from "@/components/admin/TeamForm";

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const member = await db.get("team", (await params).id);
  if (!member) notFound();
  return (
    <>
      <AdminHeader title={`Edit ${member.name}`} subtitle={member.role} />
      <div className="max-w-3xl"><TeamForm member={member} /></div>
    </>
  );
}
