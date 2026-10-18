"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

/**
 * File input with a preview, used by the team and project forms. When editing, it can also mark the
 * current image for removal (sent as removeImage=on).
 */
export function ImagePicker({ name, current, label, className = "aspect-[4/3]" }: { name: string; current?: string; label: string; className?: string }) {
  const [preview, setPreview] = useState(current);
  const [remove, setRemove] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const shown = !remove && preview;

  return (
    <div>
      <p className="label">{label}</p>
      <label className={`relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-forest-900/15 bg-sand/50 transition hover:border-forest-600 ${className}`}>
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 p-4 text-center text-sm text-muted">
            <ImagePlus className="h-6 w-6 text-gold-600" />
            Choose a photo
            <span className="text-xs">JPG, PNG or WEBP</span>
          </span>
        )}
        <input
          ref={fileRef}
          type="file"
          name={name}
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : current);
            setRemove(false);
          }}
        />
      </label>
      <input type="hidden" name="removeImage" value={remove ? "on" : ""} />
      <div className="mt-2 flex gap-4 text-xs font-semibold">
        {shown && <button type="button" onClick={() => fileRef.current?.click()} className="text-forest-700 hover:underline">Change</button>}
        {shown && (
          <button
            type="button"
            onClick={() => {
              if (fileRef.current) fileRef.current.value = "";
              setPreview(current);
              setRemove(true);
            }}
            className="text-red-700 hover:underline"
          >
            Remove
          </button>
        )}
        {remove && current && <button type="button" onClick={() => setRemove(false)} className="text-forest-700 hover:underline">Undo remove</button>}
      </div>
    </div>
  );
}
