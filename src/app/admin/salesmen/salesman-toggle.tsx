"use client";

import { useTransition } from "react";
import { setSalesmanActive } from "./actions";
import { cn } from "@/lib/utils";

export function SalesmanToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => setSalesmanActive(id, !active))}
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50",
        active ? "bg-success-bg text-success" : "bg-muted-bg text-muted",
      )}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}
