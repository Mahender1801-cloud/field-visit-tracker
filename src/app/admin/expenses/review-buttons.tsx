"use client";

import { useTransition } from "react";
import { reviewExpense } from "./actions";
import { Check, X } from "lucide-react";

export function ReviewButtons({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <button
        disabled={pending}
        onClick={() => startTransition(() => reviewExpense(id, "Approved"))}
        className="flex items-center gap-1 rounded-lg bg-success-bg px-2.5 py-1 text-xs font-medium text-success disabled:opacity-50"
      >
        <Check size={12} /> Approve
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(() => reviewExpense(id, "Rejected"))}
        className="flex items-center gap-1 rounded-lg bg-danger-bg px-2.5 py-1 text-xs font-medium text-danger disabled:opacity-50"
      >
        <X size={12} /> Reject
      </button>
    </div>
  );
}
