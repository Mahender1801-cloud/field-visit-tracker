"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ListChecks, Users, Wallet, LogOut } from "lucide-react";
import { signOutAdmin } from "@/app/admin/actions";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/visits", label: "Visits", icon: ListChecks },
  { href: "/admin/salesmen", label: "Salesmen", icon: Users },
  { href: "/admin/expenses", label: "Expenses", icon: Wallet },
];

export function AdminNav({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">FT</div>
        <span className="font-semibold text-foreground">FieldTrack</span>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium",
                active ? "bg-primary/10 text-primary" : "text-muted hover:bg-muted-bg hover:text-foreground",
              )}
            >
              <Icon size={17} /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border pt-4">
        <p className="px-2 text-xs text-muted">Signed in as</p>
        <p className="px-2 pb-3 text-sm font-medium text-foreground">{name}</p>
        <form action={signOutAdmin}>
          <button type="submit" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-muted-bg hover:text-foreground">
            <LogOut size={16} /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
