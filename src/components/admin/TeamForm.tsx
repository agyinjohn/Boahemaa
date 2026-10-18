"use client";

import Link from "next/link";
import { ArrowLeft, CircleCheck, Loader2, Save } from "lucide-react";
import { saveTeamMember, type FormState } from "@/app/actions";
import type { TeamMember } from "@/lib/db";
import { useUploadForm } from "@/lib/useUploadForm";
import { ImagePicker } from "./ImagePicker";

const DEPARTMENTS = ["Leadership", "Operations", "Claims", "Technology", "Marketing", "Finance", "Sales & Agents"];

export function TeamForm({ member }: { member?: TeamMember }) {
  const { state, onSubmit, busy, uploading, error } = useUploadForm<FormState>(saveTeamMember, {}, { photo: "image" });

  return (
    <form onSubmit={onSubmit} className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
      {member && <input type="hidden" name="id" value={member.id} />}
      <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
        <ImagePicker name="photo" current={member?.photo} label="Photo" className="aspect-[4/5]" />
        <div className="grid content-start gap-5">
          <div>
            <label htmlFor="name" className="label">Full name *</label>
            <input id="name" name="name" required maxLength={80} defaultValue={member?.name} className="field" placeholder="e.g. Akosua Mensah" />
          </div>
          <div>
            <label htmlFor="role" className="label">Job title *</label>
            <input id="role" name="role" required maxLength={80} defaultValue={member?.role} className="field" placeholder="e.g. Head of Claims" />
          </div>
          <div>
            <label htmlFor="dept" className="label">Department</label>
            <input id="dept" name="dept" list="departments" maxLength={40} defaultValue={member?.dept ?? "Operations"} className="field" />
            <datalist id="departments">
              {DEPARTMENTS.map((d) => <option key={d} value={d} />)}
            </datalist>
            <p className="mt-1.5 text-xs text-muted">People in <strong>Leadership</strong> appear in the large cards at the top of the team page.</p>
          </div>
          <div>
            <label htmlFor="bio" className="label">Short bio</label>
            <textarea id="bio" name="bio" rows={3} maxLength={200} defaultValue={member?.bio} className="field" placeholder="One sentence about what they do (max 200 characters)" />
          </div>
        </div>
      </div>
      {error && <p className="mt-5 text-sm text-clay-500">{error}</p>}
      {state.ok && <p className="mt-5 flex items-center gap-2 text-sm text-forest-700"><CircleCheck className="h-4 w-4" /> Changes saved!</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button disabled={busy} className="btn btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {uploading ? "Uploading photo…" : member ? "Save changes" : "Add team member"}
        </button>
        <Link href="/admin/team" className="btn btn-ghost"><ArrowLeft className="h-4 w-4" /> Back to team</Link>
      </div>
    </form>
  );
}
