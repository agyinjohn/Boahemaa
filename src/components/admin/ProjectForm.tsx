"use client";

import Link from "next/link";
import { ArrowLeft, CircleCheck, Loader2, Save } from "lucide-react";
import { saveProject, type FormState } from "@/app/actions";
import type { Project } from "@/lib/db";
import { useUploadForm } from "@/lib/useUploadForm";
import { ImagePicker } from "./ImagePicker";

const TAGS = ["Health", "Motor", "Property", "Life", "Education", "Agriculture", "Community"];

export function ProjectForm({ project }: { project?: Project }) {
  const { state, onSubmit, busy, uploading, error } = useUploadForm<FormState>(saveProject, {}, { image: "image" });

  return (
    <form onSubmit={onSubmit} className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
      {project && <input type="hidden" name="id" value={project.id} />}
      <div className="grid gap-5">
        <div>
          <label htmlFor="title" className="label">Project name *</label>
          <input id="title" name="title" required maxLength={100} defaultValue={project?.title} className="field" placeholder="e.g. Market Women Health Drive" />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="place" className="label">Place</label>
            <input id="place" name="place" maxLength={60} defaultValue={project?.place} className="field" placeholder="e.g. Makola, Accra" />
          </div>
          <div>
            <label htmlFor="year" className="label">Year *</label>
            <input id="year" name="year" required inputMode="numeric" pattern="(19|20)[0-9]{2}" defaultValue={project?.year ?? String(new Date().getFullYear())} className="field" />
          </div>
          <div>
            <label htmlFor="tag" className="label">Tag</label>
            <input id="tag" name="tag" list="tags" maxLength={30} defaultValue={project?.tag ?? "Community"} className="field" />
            <datalist id="tags">
              {TAGS.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
        </div>
        <div>
          <label htmlFor="text" className="label">Description *</label>
          <textarea id="text" name="text" required rows={4} maxLength={400} defaultValue={project?.text} className="field" placeholder="What happened and who it helped (max 400 characters)" />
        </div>
        <ImagePicker name="image" current={project?.image} label="Photo (optional)" className="aspect-[2/1]" />
      </div>
      {error && <p className="mt-5 text-sm text-clay-500">{error}</p>}
      {state.ok && <p className="mt-5 flex items-center gap-2 text-sm text-forest-700"><CircleCheck className="h-4 w-4" /> Changes saved!</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button disabled={busy} className="btn btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {uploading ? "Uploading photo…" : project ? "Save changes" : "Add project"}
        </button>
        <Link href="/admin/projects" className="btn btn-ghost"><ArrowLeft className="h-4 w-4" /> Back to projects</Link>
      </div>
    </form>
  );
}
