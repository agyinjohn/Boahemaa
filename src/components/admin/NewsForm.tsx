"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleCheck, ImagePlus, Loader2, Send } from "lucide-react";
import { createNews, type FormState } from "@/app/actions";

export function NewsForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createNews, {});
  const [preview, setPreview] = useState<string>();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setPreview(undefined);
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-medium text-forest-950">Write a new story</h2>
      <div className="mt-6 grid gap-5">
        <div>
          <label htmlFor="title" className="label">Headline *</label>
          <input id="title" name="title" required className="field" placeholder="e.g. SUSU BOX opens new branch in Ho" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="label">Category</label>
            <select id="category" name="category" className="field">
              {["News", "Community", "Announcement", "Guide", "Event"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Cover image</label>
            <label className="field flex cursor-pointer items-center gap-2 text-muted">
              <ImagePlus className="h-4 w-4" /> {preview ? "Change image" : "Choose image"}
              <input
                type="file"
                name="image"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPreview(f ? URL.createObjectURL(f) : undefined);
                }}
              />
            </label>
          </div>
        </div>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="aspect-[21/9] w-full rounded-2xl object-cover" />
        )}
        <div>
          <label htmlFor="excerpt" className="label">Short summary</label>
          <input id="excerpt" name="excerpt" className="field" placeholder="One sentence shown on the news cards (optional)" />
        </div>
        <div>
          <label htmlFor="body" className="label">Story *</label>
          <textarea id="body" name="body" required rows={8} className="field" placeholder="Write the full story. Leave a blank line between paragraphs." />
        </div>
      </div>
      {state.error && <p className="mt-4 text-sm text-clay-500">{state.error}</p>}
      {state.ok && <p className="mt-4 flex items-center gap-2 text-sm text-forest-700"><CircleCheck className="h-4 w-4" /> Story published!</p>}
      <button disabled={pending} className="btn btn-primary mt-6">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Publish story
      </button>
    </form>
  );
}
