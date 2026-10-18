"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import { login } from "@/app/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="mt-10 space-y-5">
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required autoFocus className="field" placeholder="••••••••" />
      </div>
      {state?.error && <p className="text-sm text-clay-500">{state.error}</p>}
      <button disabled={pending} className="btn btn-primary w-full">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Sign in
      </button>
      <Link href="/" className="flex items-center justify-center gap-2 text-sm text-muted hover:text-forest-900">
        <ArrowLeft className="h-4 w-4" /> Back to website
      </Link>
    </form>
  );
}
