"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/visits", label: "Visits" },
  { href: "/admin/salesmen", label: "Salesmen" },
  { href: "/admin/expenses", label: "Expenses" },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 md:hidden">
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
  );
}
