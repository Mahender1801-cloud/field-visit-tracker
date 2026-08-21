import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ExpenseForm } from "./expense-form";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ImageViewerButton } from "@/components/image-viewer";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function ExpensesPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("salesman_id", profile.id)
    .order("expense_date", { ascending: false })
    .limit(50);

  const totalPending = expenses?.filter((e) => e.status === "Pending").reduce((s, e) => s + Number(e.amount), 0) ?? 0;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-foreground">Expenses</h1>

      <ExpenseForm />

      {totalPending > 0 && (
        <p className="text-xs text-muted">{formatCurrency(totalPending)} pending approval</p>
      )}

      <div className="space-y-2">
        {!expenses?.length ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            No expenses submitted yet.
          </p>
        ) : (
          expenses.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex items-center justify-between py-3.5">
                <div>
                  <p className="font-medium text-foreground">{formatCurrency(Number(e.amount))}</p>
                  <p className="text-xs text-muted">{formatDate(e.expense_date)}{e.note ? ` · ${e.note}` : ""}</p>
                  {e.receipt_path && (
                    <div className="mt-1">
                      <ImageViewerButton path={e.receipt_path} label="View receipt" />
                    </div>
                  )}
                </div>
                <StatusBadge status={e.status} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
