import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { company } from "@/lib/site";
import { issueFormToken } from "@/lib/spam";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = { title: "Contact" };
// Rendered per request so each visitor gets a fresh spam-protection token.
export const dynamic = "force-dynamic";

const branches = [
  { city: "Accra (Head Office)", address: "12 Independence Avenue" },
  { city: "Kumasi", address: "Adum, Prempeh II Street" },
  { city: "Takoradi", address: "Market Circle, Liberation Road" },
  { city: "Tamale", address: "Central Market Road" },
];

export default function ContactPage() {
  const cards = [
    { icon: Phone, label: "Call us", value: company.phone, href: `tel:${company.phone.replace(/\s/g, "")}` },
    { icon: MessageCircle, label: "WhatsApp", value: company.whatsapp, href: `https://wa.me/${company.whatsapp.replace(/\D/g, "")}` },
    { icon: Mail, label: "Email", value: company.email, href: `mailto:${company.email}` },
    { icon: Clock, label: "Opening hours", value: company.hours },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>We&apos;re here, <em className="text-forest-600">whenever</em> you need us.</>}
        intro="Visit a branch, call, or send us a WhatsApp message. Real people, ready to help."
      />
      <section className="container-x grid gap-5 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Reveal key={c.label} delay={i * 80}>
            <a href={c.href} className="card group flex h-full flex-col p-7 transition hover:-translate-y-1">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-forest-900 text-gold-400 transition group-hover:bg-gold-500 group-hover:text-forest-950">
                <c.icon className="h-5 w-5" />
              </span>
              <p className="mt-6 text-xs uppercase tracking-[0.18em] text-muted">{c.label}</p>
              <p className="mt-1 font-display text-xl text-forest-950">{c.value}</p>
            </a>
          </Reveal>
        ))}
      </section>
      <section className="container-x grid gap-6 pb-6 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <ContactForm formToken={issueFormToken()} />
        </Reveal>
        <Reveal delay={100}>
          <div className="flex h-full flex-col rounded-[2rem] bg-forest-900 p-10 text-cream">
            <h2 className="text-3xl font-medium">Our branches</h2>
            <ul className="mt-8 space-y-6">
              {branches.map((b) => (
                <li key={b.city} className="flex gap-4 border-b border-cream/10 pb-6 last:border-0">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold-400" />
                  <div>
                    <p className="font-semibold">{b.city}</p>
                    <p className="text-sm text-cream/60">{b.address}</p>
                  </div>
                </li>
              ))}
            </ul>
            <a
              href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-auto flex items-center gap-4 rounded-2xl bg-cream/10 p-5 transition hover:bg-cream/15"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-500 text-forest-950">
                <MessageCircle className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold">Prefer WhatsApp?</span>
                <span className="text-sm text-cream/60">Chat with us on {company.whatsapp}</span>
              </span>
            </a>
          </div>
        </Reveal>
      </section>
      <section className="container-x pb-28">
        <Reveal>
          <div className="h-96 overflow-hidden rounded-[2rem] border border-forest-900/10">
            <iframe
              title="SUSU BOX head office map"
              src="https://www.google.com/maps?q=Independence+Avenue,+Accra,+Ghana&output=embed"
              className="h-full w-full grayscale-[40%]"
              loading="lazy"
            />
          </div>
        </Reveal>
      </section>
    </>
  );
}
