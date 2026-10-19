import { CreditCard, Database, ImageUp, MessageSquare, TriangleAlert } from "lucide-react";
import { paystackEnabled } from "@/lib/paystack";
import { smsEnabled } from "@/lib/sms";
import { readOnlyHost, store } from "@/lib/store";
import { usingCloudinary } from "@/lib/storage";

type Level = "ok" | "off" | "broken";

/** Shows whether the services the site depends on are connected, so staff can spot setup problems. */
export function Integrations() {
  const testMode = process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_test_");
  const items: { icon: typeof Database; name: string; level: Level; text: string }[] = [
    {
      icon: Database,
      name: "Database",
      level: store ? "ok" : readOnlyHost ? "broken" : "ok",
      text: store ? `Connected (${store.kind})` : readOnlyHost ? "NOT CONNECTED: nothing can be saved" : "Local files in data/",
    },
    {
      icon: ImageUp,
      name: "File uploads",
      level: usingCloudinary ? "ok" : readOnlyHost ? "broken" : "ok",
      text: usingCloudinary ? "Cloudinary" : readOnlyHost ? "NOT SET UP: add Cloudinary keys" : "Local disk in data/uploads",
    },
    {
      icon: CreditCard,
      name: "Paystack payments",
      level: paystackEnabled ? "ok" : "off",
      text: paystackEnabled ? (testMode ? "Connected (test mode, no real money)" : "Connected (live)") : "Not set up: add PAYSTACK_SECRET_KEY",
    },
    {
      icon: MessageSquare,
      name: "mNotify SMS",
      level: smsEnabled ? "ok" : "off",
      text: smsEnabled ? "Connected" : "Demo mode: messages are logged, not sent",
    },
  ];
  const dot = { ok: "bg-forest-600", off: "bg-gold-500", broken: "bg-red-600" };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((i) => (
        <div key={i.name} className={`flex items-center gap-4 rounded-2xl p-4 shadow-sm ${i.level === "broken" ? "bg-red-50 ring-1 ring-red-200" : "bg-white"}`}>
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${i.level === "ok" ? "bg-forest-900 text-gold-400" : i.level === "broken" ? "bg-red-600 text-white" : "bg-sand text-muted"}`}>
            <i.icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-forest-950">
              {i.name}
              <span className={`h-2 w-2 rounded-full ${dot[i.level]}`} />
            </p>
            <p className={`truncate text-xs ${i.level === "broken" ? "font-semibold text-red-700" : "text-muted"}`}>{i.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** A banner across the admin when the site can't save anything (e.g. on Vercel with no database). */
export function SetupWarning() {
  if (!readOnlyHost || (store && usingCloudinary)) return null;
  return (
    <div className="mb-8 flex gap-4 rounded-2xl bg-red-600 p-5 text-white">
      <TriangleAlert className="h-6 w-6 shrink-0" />
      <div className="text-sm">
        <p className="font-semibold">This website can&apos;t save {store ? "uploaded files" : "anything"} yet.</p>
        <p className="mt-1 text-white/85">
          {!store && "Applications, messages and claims will fail until a database is connected: in Vercel open Storage → Upstash for Redis → Connect, then redeploy. "}
          {!usingCloudinary && "Uploads need Cloudinary: add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Settings → Environment Variables, then redeploy."}
        </p>
      </div>
    </div>
  );
}
