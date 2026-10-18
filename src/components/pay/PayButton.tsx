"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { startPayment, type FormState } from "@/app/actions";
import { cedis } from "@/lib/site";

export function PayButton({ reference, amount, className = "" }: { reference: string; amount: number; className?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(startPayment, {});
  return (
    <form action={action} className={className}>
      <input type="hidden" name="reference" value={reference} />
      <button disabled={pending} className="btn btn-gold w-full py-4 text-base">
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
        {pending ? "Opening secure checkout…" : `Pay ${cedis(amount)} now`}
      </button>
      {state.error && <p className="mt-3 text-center text-sm text-clay-500">{state.error}</p>}
      <p className="mt-3 text-center text-xs text-muted">MTN MoMo · Telecel Cash · AirtelTigo Money · Visa · Mastercard</p>
    </form>
  );
}
