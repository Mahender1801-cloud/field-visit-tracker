"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, PlusCircle, History, Wallet } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/visit/new", label: "New Visit", icon: PlusCircle },
  { href: "/history", label: "History", icon: History },
  { href: "/expenses", label: "Expenses", icon: Wallet },
];

export function SalesmanNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium",
                active ? "text-primary" : "text-muted",
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
