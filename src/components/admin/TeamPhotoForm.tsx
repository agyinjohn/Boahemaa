"use client";

import { useActionState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { uploadTeamPhoto, type FormState } from "@/app/actions";

/** Uploads a team member's photo as soon as a file is chosen. */
export function TeamPhotoForm({ slug, hasPhoto }: { slug: string; hasPhoto: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(uploadTeamPhoto, {});
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="slug" value={slug} />
      <label className={`btn btn-primary cursor-pointer whitespace-nowrap px-4 py-2 ${pending ? "pointer-events-none opacity-60" : ""}`}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        {hasPhoto ? "Change photo" : "Upload photo"}
        <input
          type="file"
          name="photo"
          accept="image/*"
          className="sr-only"
          onChange={(e) => e.target.files?.length && formRef.current?.requestSubmit()}
        />
      </label>
      {state.error && <p className="mt-2 text-xs text-clay-500">{state.error}</p>}
    </form>
  );
}
