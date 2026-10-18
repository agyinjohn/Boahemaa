import { CircleCheck } from "lucide-react";
import type { Application } from "@/lib/db";
import { cedis } from "@/lib/site";
import { formatDate } from "@/lib/format";

const channelName: Record<string, string> = { mobile_money: "Mobile Money", card: "Card" };

export function Receipt({ app }: { app: Application }) {
  const p = app.payment!;
  return (
    <div className="card relative overflow-hidden p-8 text-center md:p-12">
      <div className="kente-strip absolute inset-x-0 top-0 h-2" />
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-forest-600 text-cream">
        <CircleCheck className="h-10 w-10" />
      </span>
      <h1 className="mt-6 text-4xl font-medium text-forest-950">Payment received</h1>
      <p className="mt-3 text-muted">Thank you, {app.fullName.split(" ")[0]}. We&apos;ve sent you an SMS receipt. An advisor will call you to activate your cover.</p>
      <dl className="mx-auto mt-8 max-w-sm divide-y divide-dashed divide-forest-900/15 rounded-2xl border border-dashed border-forest-900/20 bg-forest-50 px-6 text-left text-sm">
        {[
          ["Amount", cedis(p.amount)],
          ["Cover", `${app.product} · ${app.plan}`],
          ["Paid with", channelName[p.channel] ?? p.channel],
          ["Date", formatDate(p.paidAt)],
          ["Application", app.reference],
          ["Transaction", p.reference],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-3">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-semibold text-forest-950">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
