"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Cloudflare Turnstile widget (https://developers.cloudflare.com/turnstile/).
 * It adds a hidden "cf-turnstile-response" field to the surrounding form, which the server
 * checks with Cloudflare (lib/spam.ts). Most visitors pass without clicking anything.
 */

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<void> | null = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** A problem inside Cloudflare's script must never crash the form around it. */
function safely(fn: () => unknown) {
  try {
    fn();
  } catch (err) {
    console.error("Turnstile error", err);
  }
}

export function Turnstile({
  siteKey,
  action,
  onVerify,
  resetKey,
}: {
  siteKey: string;
  /** Shown in the Cloudflare dashboard analytics, e.g. "apply". */
  action: string;
  /** Called with the token once the visitor passes, and with null when it expires or resets. */
  onVerify?: (token: string | null) => void;
  /** Change this (e.g. pass the form's result state) to get a fresh token after each submit. */
  resetKey?: unknown;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const callback = useRef(onVerify);
  callback.current = onVerify;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          action,
          theme: "light",
          size: "flexible",
          callback: (token: string) => callback.current?.(token),
          "expired-callback": () => callback.current?.(null),
          "error-callback": () => callback.current?.(null),
        });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      safely(() => widgetId.current && window.turnstile?.remove(widgetId.current));
      widgetId.current = undefined;
      callback.current?.(null);
    };
  }, [siteKey, action]);

  // Tokens can only be used once, so get a new one after every submission.
  useEffect(() => {
    if (widgetId.current && window.turnstile) {
      safely(() => window.turnstile!.reset(widgetId.current!));
      callback.current?.(null);
    }
  }, [resetKey]);

  return (
    <div className="min-h-[65px]">
      <div ref={ref} />
      {failed && (
        <p className="text-sm text-clay-500">The security check couldn&apos;t load. Please check your connection and refresh the page.</p>
      )}
    </div>
  );
}
