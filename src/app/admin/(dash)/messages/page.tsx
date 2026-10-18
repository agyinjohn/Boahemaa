import Link from "next/link";
import { Mail, MailOpen, MessageCircle, Phone, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { deleteMessage, toggleMessageRead } from "@/app/actions";
import { normalizePhone } from "@/lib/sms";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** WhatsApp link for a Ghanaian number (024… → 23324…). */
const whatsapp = (phone: string) => `https://wa.me/233${normalizePhone(phone).replace(/^0/, "")}`;

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams;
  const all = await db.list("messages");
  const unread = all.filter((m) => !m.read).length;
  const items = show === "unread" ? all.filter((m) => !m.read) : all;

  return (
    <>
      <AdminHeader title="Messages" subtitle="Messages sent through the contact form on the website." />
      <div className="mb-6 flex gap-2">
        {[
          { key: undefined, label: "All", count: all.length },
          { key: "unread", label: "Unread", count: unread },
        ].map((f) => (
          <Link
            key={f.label}
            href={f.key ? `/admin/messages?show=${f.key}` : "/admin/messages"}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${show === f.key ? "bg-forest-900 text-cream" : "bg-white text-forest-900 hover:bg-forest-50"}`}
          >
            {f.label} <span className="ml-1 opacity-60">{f.count}</span>
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center text-muted shadow-sm">No messages here.</div>
      ) : (
        <ul className="space-y-4">
          {items.map((m) => (
            <li key={m.id} className={`rounded-3xl bg-white p-6 shadow-sm ${m.read ? "" : "ring-2 ring-gold-200"}`}>
              <div className="flex flex-wrap items-start gap-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-lg ${m.read ? "bg-sand text-muted" : "bg-forest-900 text-gold-400"}`}>
                  {m.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-forest-950">{m.name}</span>
                    <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-medium text-forest-800">{m.topic}</span>
                    {!m.read && <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase text-forest-950">New</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{when(m.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <form action={toggleMessageRead}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="read" value={String(!m.read)} />
                    <button className="grid h-9 w-9 place-items-center rounded-full text-forest-700 hover:bg-sand" title={m.read ? "Mark as unread" : "Mark as read"} aria-label={m.read ? "Mark as unread" : "Mark as read"}>
                      {m.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                    </button>
                  </form>
                  <form action={deleteMessage}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmButton message={`Delete the message from ${m.name}?`} className="grid h-9 w-9 place-items-center rounded-full text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </ConfirmButton>
                  </form>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink/85">{m.message}</p>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-forest-900/8 pt-4">
                {m.phone && (
                  <>
                    <a href={`tel:${m.phone.replace(/\s/g, "")}`} className="btn btn-ghost px-4 py-2"><Phone className="h-4 w-4" /> {m.phone}</a>
                    <a href={whatsapp(m.phone)} target="_blank" rel="noreferrer" className="btn btn-ghost px-4 py-2"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
                  </>
                )}
                {m.email && (
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: your ${m.topic.toLowerCase()} message to SUSU BOX`)}`} className="btn btn-ghost px-4 py-2">
                    <Mail className="h-4 w-4" /> {m.email}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
