"use client";

import { startTransition, useActionState } from "react";
import { CircleCheck, Loader2, Send } from "lucide-react";
import { sendTestSms, type FormState } from "@/app/actions";

export function TestSmsForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(sendTestSms, {});
  return (
    <form onSubmit={(e) => {
        // Submit manually: a plain form action would clear what the person typed if there's an error.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }} className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-medium text-forest-950">Send a test SMS</h2>
      <p className="mt-1 text-sm text-muted">Check that mNotify is set up correctly.</p>
      <div className="mt-6 grid gap-4">
        <div>
          <label htmlFor="phone" className="label">Phone number</label>
          <input id="phone" name="phone" type="tel" required className="field" placeholder="024 000 0000" />
        </div>
        <div>
          <label htmlFor="message" className="label">Message</label>
          <textarea id="message" name="message" rows={3} maxLength={320} className="field" placeholder="Test message from the SUSU BOX website." />
        </div>
      </div>
      {state.error && <p className="mt-4 text-sm text-clay-500">{state.error}</p>}
      {state.ok && <p className="mt-4 flex items-center gap-2 text-sm text-forest-700"><CircleCheck className="h-4 w-4" /> Done. See the log.</p>}
      <button disabled={pending} className="btn btn-primary mt-6">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send SMS
      </button>
    </form>
  );
}
