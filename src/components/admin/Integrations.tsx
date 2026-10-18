import { CreditCard, MessageSquare } from "lucide-react";
import { paystackEnabled } from "@/lib/paystack";
import { smsEnabled } from "@/lib/sms";

/** Shows whether Paystack and mNotify are connected, so staff know if payments/SMS are live. */
export function Integrations() {
  const testMode = process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_test_");
  const items = [
    {
      icon: CreditCard,
      name: "Paystack payments",
      on: paystackEnabled,
      text: paystackEnabled ? (testMode ? "Connected (test mode, no real money)" : "Connected (live)") : "Not set up: add PAYSTACK_SECRET_KEY",
    },
    {
      icon: MessageSquare,
      name: "mNotify SMS",
      on: smsEnabled,
      text: smsEnabled ? "Connected" : "Demo mode: messages are logged, not sent",
    },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((i) => (
        <div key={i.name} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${i.on ? "bg-forest-900 text-gold-400" : "bg-sand text-muted"}`}>
            <i.icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-forest-950">
              {i.name}
              <span className={`h-2 w-2 rounded-full ${i.on ? "bg-forest-600" : "bg-gold-500"}`} />
            </p>
            <p className="truncate text-xs text-muted">{i.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
