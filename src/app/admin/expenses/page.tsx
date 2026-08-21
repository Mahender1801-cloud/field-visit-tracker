import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ReviewButtons } from "./review-buttons";
import { ImageViewerButton } from "@/components/image-viewer";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function AdminExpensesPage() {
  const supabase = await createClient();

  const [{ data: expenses }, { data: salesmen }] = await Promise.all([
    supabase.from("expenses").select("*").order("expense_date", { ascending: false }).limit(200),
    supabase.from("profiles").select("id, full_name"),
  ]);

  const nameMap = new Map((salesmen ?? []).map((s) => [s.id, s.full_name]));
  const pendingTotal = (expenses ?? []).filter((e) => e.status === "Pending").reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Expenses</h1>
        <p className="text-sm text-muted">{formatCurrency(pendingTotal)} awaiting approval</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted-bg text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Salesman</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(expenses ?? []).map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(e.expense_date)}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{nameMap.get(e.salesman_id) ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground">{formatCurrency(Number(e.amount))}</td>
                  <td className="px-4 py-3 text-muted">{e.note ?? "—"}</td>
                  <td className="px-4 py-3">
                    {e.receipt_path ? <ImageViewerButton path={e.receipt_path} label="View" /> : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {e.status === "Pending" ? <ReviewButtons id={e.id} /> : <StatusBadge status={e.status} />}
                  </td>
                </tr>
              ))}
              {!expenses?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">No expenses submitted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
