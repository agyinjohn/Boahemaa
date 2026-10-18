import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const project = await db.get("projects", (await params).id);
  if (!project) notFound();
  return (
    <>
      <AdminHeader title="Edit project" subtitle={project.title} />
      <div className="max-w-3xl"><ProjectForm project={project} /></div>
    </>
  );
}
