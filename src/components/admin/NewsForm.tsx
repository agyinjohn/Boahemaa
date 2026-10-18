"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CircleCheck, ImagePlus, Loader2, Save, Send } from "lucide-react";
import { createNews, updateNews, type FormState } from "@/app/actions";
import type { News } from "@/lib/db";
import { useUploadForm } from "@/lib/useUploadForm";

const CATEGORIES = ["News", "Community", "Announcement", "Guide", "Event"];

/** Writes a new story, or edits `item` when given. */
export function NewsForm({ item }: { item?: News }) {
  const editing = Boolean(item);
  const { state, onSubmit, busy, uploading, error } = useUploadForm<FormState>(editing ? updateNews : createNews, {}, { image: "image" });
  const [preview, setPreview] = useState(item?.image);
  const [removeImage, setRemoveImage] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.ok && !editing) {
      formRef.current?.reset();
      setPreview(undefined);
    }
  }, [state, editing]);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
      {item && <input type="hidden" name="id" value={item.id} />}
      {!editing && <h2 className="mb-6 text-2xl font-medium text-forest-950">Write a new story</h2>}
      <div className="grid gap-5">
        <div>
          <label htmlFor="title" className="label">Headline *</label>
          <input id="title" name="title" required defaultValue={item?.title} className="field" placeholder="e.g. SUSU BOX opens new branch in Ho" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="label">Category</label>
            <select id="category" name="category" defaultValue={item?.category ?? "News"} className="field">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Cover image</label>
            <label className="field flex cursor-pointer items-center gap-2 text-muted">
              <ImagePlus className="h-4 w-4" /> {preview && !removeImage ? "Change image" : "Choose image"}
              <input
                ref={fileRef}
                type="file"
                name="image"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPreview(f ? URL.createObjectURL(f) : item?.image);
                  setRemoveImage(false);
                }}
              />
            </label>
          </div>
        </div>
        {preview && !removeImage && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="aspect-[21/9] w-full rounded-2xl object-cover" />
            {editing && (
              <button
                type="button"
                onClick={() => {
                  if (fileRef.current) fileRef.current.value = "";
                  setRemoveImage(true);
                }}
                className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-red-700 shadow hover:bg-white"
              >
                Remove image
              </button>
            )}
          </div>
        )}
        {removeImage && (
          <p className="flex items-center justify-between rounded-2xl bg-sand px-4 py-3 text-sm text-muted">
            The cover image will be removed when you save.
            <button type="button" onClick={() => setRemoveImage(false)} className="font-semibold text-forest-700 hover:underline">Undo</button>
          </p>
        )}
        <input type="hidden" name="removeImage" value={removeImage ? "on" : ""} />
        <div>
          <label htmlFor="excerpt" className="label">Short summary</label>
          <input id="excerpt" name="excerpt" defaultValue={item?.excerpt} className="field" placeholder="One sentence shown on the news cards (leave empty to use the start of the story)" />
        </div>
        <div>
          <label htmlFor="body" className="label">Story *</label>
          <textarea id="body" name="body" required rows={editing ? 14 : 8} defaultValue={item?.body} className="field" placeholder="Write the full story. Leave a blank line between paragraphs." />
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-clay-500">{error}</p>}
      {state.ok && (
        <p className="mt-4 flex items-center gap-2 text-sm text-forest-700">
          <CircleCheck className="h-4 w-4" /> {editing ? "Changes saved!" : "Story published!"}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button disabled={busy} className="btn btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <Save className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {uploading ? "Uploading image…" : editing ? "Save changes" : "Publish story"}
        </button>
        {editing && (
          <>
            <Link href="/admin/news" className="btn btn-ghost"><ArrowLeft className="h-4 w-4" /> Back to stories</Link>
            <Link href={`/news/${item!.id}`} target="_blank" className="text-sm font-semibold text-forest-700 hover:underline">View on website</Link>
          </>
        )}
      </div>
    </form>
  );
}
