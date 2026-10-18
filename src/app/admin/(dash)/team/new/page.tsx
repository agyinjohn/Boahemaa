import { AdminHeader } from "@/components/admin/AdminHeader";
import { TeamForm } from "@/components/admin/TeamForm";

export default function NewTeamMemberPage() {
  return (
    <>
      <AdminHeader title="Add team member" subtitle="They'll appear at the end of the team list. Use the arrows to reorder." />
      <div className="max-w-3xl"><TeamForm /></div>
    </>
  );
}
