"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck, Link2, Loader2, Upload } from "lucide-react";
import { createVideo, type FormState } from "@/app/actions";
import { useUploadForm } from "@/lib/useUploadForm";

export function VideoForm() {
  const { state, onSubmit, busy, uploading, error } = useUploadForm<FormState>(createVideo, {}, { file: "video" });
  const [mode, setMode] = useState<"youtube" | "file">("youtube");
  const [fileName, setFileName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setFileName("");
    }
  }, [state]);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-medium text-forest-950">Add a video</h2>
      <div className="mt-6 inline-flex rounded-full bg-sand p-1">
        {(["youtube", "file"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${mode === m ? "bg-forest-900 text-cream" : "text-muted"}`}
          >
            {m === "youtube" ? <><Link2 className="h-4 w-4" /> YouTube link</> : <><Upload className="h-4 w-4" /> Upload file</>}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-5">
        <div>
          <label htmlFor="vtitle" className="label">Title *</label>
          <input id="vtitle" name="title" required className="field" placeholder="e.g. How to make a claim in 3 steps" />
        </div>
        {mode === "youtube" ? (
          <div>
            <label htmlFor="youtube" className="label">YouTube link *</label>
            <input id="youtube" name="youtube" required className="field" placeholder="https://www.youtube.com/watch?v=..." />
          </div>
        ) : (
          <div>
            <label className="label">Video file *</label>
            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-forest-900/15 p-5 hover:border-forest-600">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold-100 text-gold-600"><Upload className="h-5 w-5" /></span>
              <span className="text-sm">
                <span className="block font-semibold text-forest-950">{fileName || "Choose a video"}</span>
                <span className="text-muted">MP4, WEBM or MOV, up to 100 MB</span>
              </span>
              <input type="file" name="file" accept="video/*" required className="sr-only" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
            </label>
          </div>
        )}
        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea id="description" name="description" rows={3} className="field" placeholder="A short description (optional)" />
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-clay-500">{error}</p>}
      {state.ok && <p className="mt-4 flex items-center gap-2 text-sm text-forest-700"><CircleCheck className="h-4 w-4" /> Video added!</p>}
      <button disabled={busy} className="btn btn-primary mt-6">
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> {uploading ? "Uploading video…" : "Saving…"}</> : "Add video"}
      </button>
    </form>
  );
}
