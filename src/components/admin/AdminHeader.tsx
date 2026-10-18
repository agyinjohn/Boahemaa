import { LogOut } from "lucide-react";
import { logout } from "@/app/actions";

export function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-10 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-4xl font-medium text-forest-950">{title}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      </div>
      <form action={logout} className="lg:hidden">
        <button className="btn btn-ghost px-4 py-2" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
      </form>
    </header>
  );
}
