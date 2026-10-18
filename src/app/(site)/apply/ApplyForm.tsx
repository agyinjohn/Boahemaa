"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, PartyPopper, Upload } from "lucide-react";
import { submitApplication, type ApplyState } from "@/app/actions";
import { useUploadForm } from "@/lib/useUploadForm";
import { products, regions } from "@/lib/site";
import { ProductIcon } from "@/components/ProductIcon";

const steps = ["Choose cover", "Your details", "Confirm"];

export function ApplyForm({ initialProduct }: { initialProduct?: string }) {
  const { state, onSubmit, busy, uploading, error } = useUploadForm<ApplyState>(submitApplication, {}, { document: "document" });
  const [step, setStep] = useState(0);
  const [productSlug, setProductSlug] = useState(
    products.some((p) => p.slug === initialProduct) ? initialProduct! : products[0].slug,
  );
  const [plan, setPlan] = useState("");
  const [fileName, setFileName] = useState("");
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const product = products.find((p) => p.slug === productSlug)!;

  const next = () => {
    // Only move on when every field in the current step is valid.
    const fields = stepRefs.current[step]?.querySelectorAll<HTMLInputElement>("input, select, textarea") ?? [];
    for (const f of fields) if (!f.reportValidity()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  if (state.ok) {
    return (
      <div className="card relative overflow-hidden p-10 text-center md:p-16">
        <div className="kente-strip absolute inset-x-0 top-0 h-2" />
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold-500 text-forest-950">
          <PartyPopper className="h-9 w-9" />
        </span>
        <h2 className="mt-8 text-4xl font-medium text-forest-950">Thank you, {state.name}!</h2>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Your application has been received. An advisor will call you within one working day.
        </p>
        <div className="mx-auto mt-8 inline-block rounded-2xl border border-dashed border-forest-900/25 bg-forest-50 px-8 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Your reference number</p>
          <p className="mt-1 font-display text-3xl font-semibold tracking-wide text-forest-900">{state.reference}</p>
        </div>
        <div className="mt-10">
          <Link href="/" className="btn btn-primary">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="card p-6 md:p-10" onSubmit={onSubmit}>
      {/* Progress */}
      <ol className="mb-10 flex items-center gap-3">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-3">
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition ${
                i < step ? "bg-forest-600 text-cream" : i === step ? "bg-forest-900 text-gold-400 ring-4 ring-gold-200" : "bg-sand text-muted"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`hidden text-sm font-medium sm:block ${i === step ? "text-forest-950" : "text-muted"}`}>{s}</span>
            {i < steps.length - 1 && <span className={`h-px flex-1 ${i < step ? "bg-forest-600" : "bg-forest-900/10"}`} />}
          </li>
        ))}
      </ol>

      {/* Step 1: cover */}
      <div ref={(el) => { stepRefs.current[0] = el; }} hidden={step !== 0}>
        <h2 className="text-3xl font-medium text-forest-950">What would you like to protect?</h2>
        <input type="hidden" name="product" value={product.name} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {products.map((p) => (
            <button
              type="button"
              key={p.slug}
              onClick={() => { setProductSlug(p.slug); setPlan(""); }}
              className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition ${
                p.slug === productSlug ? "border-forest-700 bg-forest-50 ring-4 ring-forest-600/10" : "border-forest-900/10 bg-white hover:border-forest-900/30"
              }`}
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${p.slug === productSlug ? "bg-forest-900 text-gold-400" : "bg-sand text-forest-700"}`}>
                <ProductIcon name={p.icon} className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-forest-950">{p.name}</span>
                <span className="mt-0.5 block text-xs text-muted">From {p.from}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="label mt-8">Choose a plan *</p>
        <div className="flex flex-wrap gap-2">
          {product.plans.map((pl) => (
            <label key={pl} className="cursor-pointer">
              <input type="radio" name="plan" value={pl} required checked={plan === pl} onChange={() => setPlan(pl)} className="peer sr-only" />
              <span className="block rounded-full border border-forest-900/15 px-5 py-2.5 text-sm font-medium transition peer-checked:border-forest-900 peer-checked:bg-forest-900 peer-checked:text-cream peer-focus-visible:ring-4 peer-focus-visible:ring-gold-200">
                {pl}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Step 2: details */}
      <div ref={(el) => { stepRefs.current[1] = el; }} hidden={step !== 1}>
        <h2 className="text-3xl font-medium text-forest-950">Tell us about yourself</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="fullName">Full name *</label>
            <input id="fullName" name="fullName" required className="field" placeholder="e.g. Ama Owusu" autoComplete="name" />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone (MoMo number) *</label>
            <input id="phone" name="phone" required type="tel" pattern="[0-9+ ]{10,15}" className="field" placeholder="024 000 0000" autoComplete="tel" />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="field" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="dateOfBirth">Date of birth *</label>
            <input id="dateOfBirth" name="dateOfBirth" required type="date" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="region">Region *</label>
            <select id="region" name="region" required defaultValue="" className="field">
              <option value="" disabled>Select your region</option>
              {regions.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="occupation">Occupation</label>
            <input id="occupation" name="occupation" className="field" placeholder="e.g. Trader, driver, teacher" />
          </div>
        </div>
      </div>

      {/* Step 3: confirm */}
      <div ref={(el) => { stepRefs.current[2] = el; }} hidden={step !== 2}>
        <h2 className="text-3xl font-medium text-forest-950">Almost done</h2>
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-forest-900 p-5 text-cream">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cream/50">Selected cover</p>
            <p className="mt-1 font-display text-2xl">{product.name} · {plan || "—"}</p>
          </div>
          <button type="button" onClick={() => setStep(0)} className="text-sm font-semibold text-gold-400 hover:underline">Change</button>
        </div>
        <div className="mt-6">
          <label className="label">Ghana Card or ID (optional)</label>
          <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-forest-900/15 bg-white p-5 transition hover:border-forest-600">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold-100 text-gold-600"><Upload className="h-5 w-5" /></span>
            <span className="text-sm">
              <span className="block font-semibold text-forest-950">{fileName || "Upload a photo or PDF"}</span>
              <span className="text-muted">JPG, PNG or PDF</span>
            </span>
            <input type="file" name="document" accept="image/*,.pdf" className="sr-only" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
          </label>
        </div>
        <div className="mt-6">
          <label className="label" htmlFor="message">Anything else we should know?</label>
          <textarea id="message" name="message" rows={3} className="field" placeholder="Best time to call, family members to cover, etc." />
        </div>
        <label className="mt-6 flex items-start gap-3 text-sm text-muted">
          <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-forest-700" />
          I confirm the information above is correct and agree that SUSU BOX may contact me about this application.
        </label>
      </div>

      {error && <p className="mt-6 rounded-xl bg-clay-500/10 px-4 py-3 text-sm text-clay-500">{error}</p>}

      <div className="mt-10 flex items-center justify-between border-t border-forest-900/8 pt-6">
        {step > 0 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="btn btn-ghost">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : <span />}
        {step < steps.length - 1 ? (
          <button type="button" onClick={next} className="btn btn-primary">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="submit" disabled={busy} className="btn btn-gold">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> {uploading ? "Uploading…" : "Submitting…"}</> : <>Submit application <Check className="h-4 w-4" /></>}
          </button>
        )}
      </div>
    </form>
  );
}
