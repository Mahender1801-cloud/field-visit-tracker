import { cn } from "@/lib/utils";
import type { VisitStatus, ExpenseStatus } from "@/lib/types";

const statusStyles: Record<string, string> = {
  New: "bg-blue-50 text-blue-700",
  Interested: "bg-success-bg text-success",
  "Order Placed": "bg-success-bg text-success",
  "Not Interested": "bg-danger-bg text-danger",
  "Follow Up": "bg-warning-bg text-warning",
  Closed: "bg-muted-bg text-muted",
  Pending: "bg-warning-bg text-warning",
  Approved: "bg-success-bg text-success",
  Rejected: "bg-danger-bg text-danger",
};

export function StatusBadge({ status }: { status: VisitStatus | ExpenseStatus | string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        statusStyles[status] ?? "bg-muted-bg text-muted",
      )}
    >
      {status}
    </span>
  );
}
