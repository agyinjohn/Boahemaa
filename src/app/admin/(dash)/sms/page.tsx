import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Integrations } from "@/components/admin/Integrations";
import { TestSmsForm } from "@/components/admin/TestSmsForm";

const badge = {
  sent: "bg-forest-100 text-forest-700",
  failed: "bg-red-100 text-red-700",
  simulated: "bg-gold-100 text-gold-600",
};

const time = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function SmsPage() {
  const log = await db.list("sms");
  return (
    <>
      <AdminHeader title="SMS log" subtitle="Every SMS the website sends to customers, newest first (last 200)." />
      <Integrations />
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div><TestSmsForm /></div>
        <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-medium text-forest-950">Messages ({log.length})</h2>
          {log.length === 0 ? (
            <p className="mt-6 text-muted">No messages yet.</p>
          ) : (
            <ul className="mt-6 divide-y divide-forest-900/8">
              {log.map((m) => (
                <li key={m.id} className="py-4">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-mono font-semibold text-forest-950">{m.to}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${badge[m.status]}`}>{m.status}</span>
                    <span className="ml-auto text-xs text-muted">{time(m.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink/80">{m.message}</p>
                  {m.error && <p className="mt-1 text-xs text-red-700">{m.error}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
