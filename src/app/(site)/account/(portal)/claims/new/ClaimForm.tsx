"use client";

import { useState } from "react";
import { FileText, Loader2, Send, Upload, X } from "lucide-react";
import { submitClaim, type FormState } from "@/app/actions";
import { useUploadForm } from "@/lib/useUploadForm";

type Policy = { id: string; label: string; claimTypes: string[] };
const MAX_FILES = 5;

export function ClaimForm({ policies }: { policies: Policy[] }) {
  const { onSubmit, busy, uploading, error } = useUploadForm<FormState>(submitClaim, {}, { documents: "document" });
  const [policyId, setPolicyId] = useState(policies[0].id);
  const [files, setFiles] = useState<File[]>([]);
  const policy = policies.find((p) => p.id === policyId)!;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      onSubmit={(e) => {
        // Put the chosen files (which can be added one by one) into the form before sending.
        const input = e.currentTarget.elements.namedItem("documents") as HTMLInputElement;
        const dt = new DataTransfer();
        files.forEach((f) => dt.items.add(f));
        input.files = dt.files;
        onSubmit(e);
      }}
      className="card mt-8 p-6 md:p-10"
    >
      <div className="grid gap-6">
        <div>
          <label htmlFor="applicationId" className="label">Which policy? *</label>
          <select id="applicationId" name="applicationId" value={policyId} onChange={(e) => setPolicyId(e.target.value)} className="field">
            {policies.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <p className="label">What happened? *</p>
          <div className="flex flex-wrap gap-2">
            {policy.claimTypes.map((t) => (
              <label key={`${policy.id}-${t}`} className="cursor-pointer">
                <input type="radio" name="type" value={t} required className="peer sr-only" />
                <span className="block rounded-full border border-forest-900/15 px-4 py-2 text-sm font-medium transition peer-checked:border-forest-900 peer-checked:bg-forest-900 peer-checked:text-cream peer-focus-visible:ring-4 peer-focus-visible:ring-gold-200">
                  {t}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="incidentDate" className="label">When did it happen? *</label>
            <input id="incidentDate" name="incidentDate" type="date" required max={today} className="field" />
          </div>
          <div>
            <label htmlFor="amountClaimed" className="label">Amount you&apos;re claiming (GH₵)</label>
            <input id="amountClaimed" name="amountClaimed" inputMode="decimal" className="field" placeholder="e.g. 1,500 (optional)" />
          </div>
        </div>
        <div>
          <label htmlFor="description" className="label">Describe what happened *</label>
          <textarea id="description" name="description" required minLength={20} maxLength={2000} rows={5} className="field" placeholder="Where were you, what happened, and what was damaged or lost? Include hospital names or police report numbers if you have them." />
        </div>
        <div>
          <p className="label">Photos and documents</p>
          <p className="mb-3 text-xs text-muted">Receipts, hospital bills, police reports, photos of damage. Up to {MAX_FILES} files (JPG, PNG or PDF).</p>
          {files.length > 0 && (
            <ul className="mb-3 space-y-2">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-xl bg-sand px-4 py-2.5 text-sm">
                  <FileText className="h-4 w-4 shrink-0 text-forest-700" />
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-muted">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-muted hover:text-red-700" aria-label={`Remove ${f.name}`}>
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <label className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-forest-900/15 bg-white p-5 transition hover:border-forest-600 ${files.length >= MAX_FILES ? "pointer-events-none opacity-50" : ""}`}>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold-100 text-gold-600"><Upload className="h-5 w-5" /></span>
            <span className="text-sm">
              <span className="block font-semibold text-forest-950">{files.length ? "Add another file" : "Add photos or documents"}</span>
              <span className="text-muted">{files.length}/{MAX_FILES} added</span>
            </span>
            <input
              type="file"
              name="documents"
              multiple
              accept="image/*,.pdf"
              className="sr-only"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                setFiles((prev) => [...prev, ...picked].slice(0, MAX_FILES));
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
      {error && <p className="mt-6 rounded-xl bg-clay-500/10 px-4 py-3 text-sm text-clay-500">{error}</p>}
      <button disabled={busy} className="btn btn-gold mt-8">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {uploading ? "Uploading documents…" : busy ? "Submitting…" : "Submit claim"}
      </button>
    </form>
  );
}
