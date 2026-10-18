"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { getUploadSignature } from "@/app/actions";
import type { UploadKind } from "@/lib/storage";

/**
 * Wraps a server action for forms with file inputs. When Cloudinary is configured, each file is
 * uploaded straight from the browser to Cloudinary first (so big videos never pass through the
 * server, which on Vercel only accepts ~4.5 MB), and the form sends the upload result instead.
 */
export function useUploadForm<S extends { error?: string }>(
  action: (state: S, fd: FormData) => Promise<S>,
  initial: S,
  files: Record<string, UploadKind>,
) {
  const [state, dispatch, pending] = useActionState<S, FormData>(action as (state: Awaited<S>, fd: FormData) => Promise<S>, initial as Awaited<S>);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setUploadError(undefined);
    setUploading(true);
    try {
      for (const [field, kind] of Object.entries(files)) {
        const file = fd.get(field);
        if (!(file instanceof File) || file.size === 0) continue;
        const signature = await getUploadSignature(kind);
        if (!signature) break; // local mode: the files go with the form
        const body = new FormData();
        for (const [k, v] of Object.entries(signature.fields)) body.append(k, v);
        body.append("file", file);
        const res = await fetch(signature.url, { method: "POST", body });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message ?? "Upload failed");
        fd.set(field, JSON.stringify(json));
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
      return;
    }
    setUploading(false);
    startTransition(() => dispatch(fd));
  };

  return { state, onSubmit, uploading, busy: pending || uploading, error: uploadError ?? state.error };
}
