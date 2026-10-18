"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { CircleCheck, Loader2, Send } from "lucide-react";
import { sendMessage, type FormState } from "@/app/actions";
import { CONTACT_TOPICS } from "@/lib/site";
import { SpamTrap } from "@/components/SpamTrap";

export function ContactForm({ formToken }: { formToken: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(sendMessage, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  if (state.ok) {
    return (
      <div className="card flex h-full flex-col items-center justify-center p-10 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-forest-600 text-cream">
          <CircleCheck className="h-8 w-8" />
        </span>
        <h2 className="mt-6 text-3xl font-medium text-forest-950">Message sent!</h2>
        <p className="mt-3 max-w-sm text-muted">Thank you for reaching out. Our team will get back to you within one working day.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={(e) => {
        // Submit manually: a plain form action would clear what the person typed if there's an error.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }} className="card p-6 md:p-10">
      <SpamTrap token={formToken} />
      <h2 className="text-3xl font-medium text-forest-950">Send us a message</h2>
      <p className="mt-2 text-sm text-muted">We reply within one working day.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="label">Your name *</label>
          <input id="name" name="name" required maxLength={100} className="field" placeholder="e.g. Ama Owusu" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="cphone" className="label">Phone</label>
          <input id="cphone" name="phone" type="tel" pattern="[0-9+ \-]{10,17}" className="field" placeholder="024 000 0000" autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="cemail" className="label">Email</label>
          <input id="cemail" name="email" type="email" className="field" placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="topic" className="label">What is it about?</label>
          <select id="topic" name="topic" className="field">
            {CONTACT_TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cmessage" className="label">Message *</label>
          <textarea id="cmessage" name="message" required rows={5} maxLength={2000} className="field" placeholder="How can we help?" />
        </div>
      </div>
      {state.error && <p className="mt-5 rounded-xl bg-clay-500/10 px-4 py-3 text-sm text-clay-500">{state.error}</p>}
      <button disabled={pending} className="btn btn-primary mt-8">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send message
      </button>
    </form>
  );
}
