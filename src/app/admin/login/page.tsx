import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { LogoMark } from "@/components/Logo";
import { turnstileSiteKey } from "@/lib/spam";

export const metadata: Metadata = { title: "Staff login" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="kente relative hidden overflow-hidden lg:block grain">
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/60 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16 text-cream">
          <p className="font-display text-5xl font-light leading-tight">
            Every story you publish helps a family <em className="text-gold-400">choose protection</em>.
          </p>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-cream/60">SUSU BOX Staff Portal</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-cream p-8">
        <div className="w-full max-w-sm">
          <LogoMark className="h-14 w-14" />
          <h1 className="mt-8 text-4xl font-medium text-forest-950">Welcome back</h1>
          <p className="mt-2 text-muted">Sign in to manage news, videos and applications.</p>
          <LoginForm turnstileSiteKey={turnstileSiteKey} />
        </div>
      </div>
    </main>
  );
}
