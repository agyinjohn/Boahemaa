"use client";

import { useActionState, useState } from "react";
import { ArrowRight, KeyRound, Loader2, Smartphone } from "lucide-react";
import { requestLoginCode, verifyLoginCode, type LoginState } from "@/app/actions";
import { SpamTrap } from "@/components/SpamTrap";
import { Turnstile } from "@/components/Turnstile";

export function LoginFlow({ formToken, turnstileSiteKey }: { formToken: string; turnstileSiteKey: string | null }) {
  const [sent, requestCode, sending] = useActionState<LoginState, FormData>(requestLoginCode, {});
  const [checked, verifyCode, verifying] = useActionState<LoginState, FormData>(verifyLoginCode, {});
  const [changingNumber, setChangingNumber] = useState(false);
  const [humanToken, setHumanToken] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  const onCodeStep = sent.step === "code" && !changingNumber;

  return (
    <div className="card relative overflow-hidden p-8 md:p-10">
      <div className="kente-strip absolute inset-x-0 top-0 h-2" />
      {!onCodeStep ? (
        <form action={(fd) => { setChangingNumber(false); requestCode(fd); }}>
          <SpamTrap token={formToken} />
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-100 text-gold-600"><Smartphone className="h-6 w-6" /></span>
          <h2 className="mt-6 text-3xl font-medium text-forest-950">Sign in</h2>
          <p className="mt-2 text-sm text-muted">Enter your phone number and we&apos;ll text you a code.</p>
          <label htmlFor="phone" className="label mt-8">Phone number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoFocus
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="field text-lg tracking-wide"
            placeholder="024 123 4567"
          />
          {turnstileSiteKey && (
            <div className="mt-5"><Turnstile siteKey={turnstileSiteKey} action="customer-login" onVerify={setHumanToken} resetKey={sent} /></div>
          )}
          {sent.error && <p className="mt-4 text-sm text-clay-500">{sent.error}</p>}
          <button disabled={sending || (!!turnstileSiteKey && !humanToken)} className="btn btn-primary mt-6 w-full py-4">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Send me a code
          </button>
        </form>
      ) : (
        <form action={verifyCode}>
          <input type="hidden" name="phone" value={sent.phone} />
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-100 text-gold-600"><KeyRound className="h-6 w-6" /></span>
          <h2 className="mt-6 text-3xl font-medium text-forest-950">Enter your code</h2>
          <p className="mt-2 text-sm text-muted">
            We sent a 6-digit code to <strong className="text-forest-900">{sent.phone}</strong>.{" "}
            <button type="button" onClick={() => setChangingNumber(true)} className="font-semibold text-forest-700 hover:underline">Change number</button>
          </p>
          {sent.demoCode && (
            <p className="mt-5 rounded-2xl border border-dashed border-gold-500 bg-gold-100 px-4 py-3 text-sm text-forest-950">
              <strong>Demo mode:</strong> SMS isn&apos;t set up, so here is your code: <span className="font-mono text-lg font-bold tracking-widest">{sent.demoCode}</span>
            </p>
          )}
          <label htmlFor="code" className="label mt-8">6-digit code</label>
          <input
            id="code"
            name="code"
            required
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            className="field text-center font-mono text-3xl tracking-[0.5em]"
            placeholder="••••••"
          />
          {checked.error && <p className="mt-4 text-sm text-clay-500">{checked.error}</p>}
          <button disabled={verifying} className="btn btn-primary mt-6 w-full py-4">
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Sign in
          </button>
          <p className="mt-5 text-center text-sm text-muted">
            Didn&apos;t get it? <button type="button" onClick={() => setChangingNumber(true)} className="font-semibold text-forest-700 hover:underline">Send a new code</button>
          </p>
        </form>
      )}
    </div>
  );
}
