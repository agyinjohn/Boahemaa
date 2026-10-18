import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <>
      <AdminHeader title="Add project" subtitle="It will appear at the end of the list. Use the arrows to reorder." />
      <div className="max-w-3xl"><ProjectForm /></div>
    </>
  );
}
