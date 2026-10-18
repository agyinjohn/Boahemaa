"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { CircleCheck, Loader2, Send } from "lucide-react";
import { updateClaim, type FormState } from "@/app/actions";
import { CLAIM_STATUSES, type ClaimStatus } from "@/lib/claimStatus";

export function ClaimUpdateForm({ id, status, approvedAmount }: { id: string; status: ClaimStatus; approvedAmount?: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateClaim, {});
  const [next, setNext] = useState<ClaimStatus>(status);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const needsAmount = next === "Approved" || next === "Paid";

  useEffect(() => {
    if (state.ok && noteRef.current) noteRef.current.value = "";
  }, [state]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="rounded-2xl bg-sand/60 p-5"
    >
      <input type="hidden" name="id" value={id} />
      <p className="text-sm font-semibold text-forest-950">Update claim</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <select name="status" value={next} onChange={(e) => setNext(e.target.value as ClaimStatus)} className="field py-2.5">
          {CLAIM_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input
          name="approvedAmount"
          inputMode="decimal"
          defaultValue={approvedAmount}
          required={needsAmount}
          placeholder={needsAmount ? "Approved amount (GH₵) *" : "Approved amount (GH₵)"}
          className="field py-2.5"
        />
      </div>
      <textarea
        ref={noteRef}
        name="note"
        rows={2}
        maxLength={500}
        className="field mt-3"
        placeholder={next === "More Info Needed" ? "What do you need from the customer? (they'll see this and get it by SMS)" : "Note for the customer (optional, sent by SMS)"}
        required={next === "More Info Needed" && next !== status}
      />
      {state.error && <p className="mt-2 text-sm text-clay-500">{state.error}</p>}
      {state.ok && <p className="mt-2 flex items-center gap-2 text-sm text-forest-700"><CircleCheck className="h-4 w-4" /> Updated, and the customer has been notified.</p>}
      <button disabled={pending} className="btn btn-primary mt-3 px-5 py-2.5">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Save &amp; notify customer
      </button>
    </form>
  );
}
