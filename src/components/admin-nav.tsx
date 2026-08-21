"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ListChecks, Users, Wallet, LogOut, Settings, Clock4 } from "lucide-react";
import { signOutAdmin } from "@/app/admin/actions";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/visits", label: "Visits", icon: ListChecks },
  { href: "/admin/attendance", label: "Attendance", icon: Clock4 },
  { href: "/admin/salesmen", label: "Salesmen", icon: Users },
  { href: "/admin/expenses", label: "Expenses", icon: Wallet },
];

export function AdminNav({ name }: { name: string }) {
  const pathname = usePathname();
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

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
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted hover:bg-muted-bg hover:text-foreground",
              )}
            >
              <Icon size={17} /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border pt-4">
        <Link
          href="/admin/settings"
          className={cn(
            "mb-1 flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-muted-bg",
            pathname === "/admin/settings" && "bg-primary/10",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <p className="flex items-center gap-1 text-xs text-muted"><Settings size={11} /> Account settings</p>
          </div>
        </Link>
        <form action={signOutAdmin}>
          <button type="submit" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-muted-bg hover:text-foreground">
            <LogOut size={16} /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
