"use client";

import { useTransition } from "react";
import { setSalesmanActive } from "./actions";
import { cn } from "@/lib/utils";
import { UserX, UserCheck } from "lucide-react";

export function SalesmanToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => setSalesmanActive(id, !active))}
      title={active ? "Stop this salesman from logging in — their history is kept and you can restore them anytime." : "Restore this salesman's access."}
      className={cn(
        "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50",
        active ? "bg-danger-bg text-danger hover:opacity-80" : "bg-success-bg text-success hover:opacity-80",
      )}
    >
      {active ? <UserX size={12} /> : <UserCheck size={12} />}
      {active ? "Deactivate" : "Restore"}
    </button>
  );
}
