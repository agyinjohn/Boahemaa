import Link from "next/link";
import { LogOut } from "lucide-react";
import { customerLogout } from "@/app/actions";
import { customerData, requireCustomer } from "@/lib/customer";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const phone = await requireCustomer();
  const { name } = await customerData(phone);
  return (
    <div className="container-x py-10 md:py-14">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-forest-900 px-6 py-5 text-cream">
        <Link href="/account" className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-500 font-display text-xl text-forest-950">
            {(name ?? "S").charAt(0).toUpperCase()}
          </span>
          <span>
            <span className="block text-xs uppercase tracking-[0.2em] text-cream/50">My SUSU BOX</span>
            <span className="block font-display text-xl">{name ?? "Welcome"}</span>
          </span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-mono text-cream/60">{phone}</span>
          <form action={customerLogout}>
            <button className="btn btn-ghost-light px-4 py-2"><LogOut className="h-4 w-4" /> Sign out</button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
