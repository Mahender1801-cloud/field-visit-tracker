"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOutAdmin } from "@/app/admin/actions";
import { LogOut } from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/visits", label: "Visits" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/salesmen", label: "Salesmen" },
  { href: "/admin/expenses", label: "Expenses" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between gap-1 border-b border-border bg-card px-3 py-2 md:hidden">
      <div className="flex gap-1 overflow-x-auto">
        {items.map(({ href, label }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium",
                active ? "bg-primary/10 text-primary" : "text-muted",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <form action={signOutAdmin}>
        <button type="submit" aria-label="Sign out" className="shrink-0 rounded-lg p-2 text-muted hover:text-foreground">
          <LogOut size={16} />
        </button>
      </form>
    </div>
  );
}
