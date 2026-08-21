import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { AddSalesmanForm } from "./add-salesman-form";
import { SalesmanToggle } from "./salesman-toggle";
import { formatDate } from "@/lib/utils";

export default async function SalesmenPage() {
  const supabase = await createClient();

  const [{ data: salesmen }, { data: visitCounts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "salesman").order("created_at", { ascending: false }),
    supabase.from("visits").select("salesman_id"),
  ]);

  const counts = new Map<string, number>();
  (visitCounts ?? []).forEach((v) => counts.set(v.salesman_id, (counts.get(v.salesman_id) ?? 0) + 1));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Salesmen</h1>
          <p className="text-sm text-muted">{salesmen?.length ?? 0} team member{salesmen?.length === 1 ? "" : "s"}</p>
        </div>
        <AddSalesmanForm />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted-bg text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Total Visits</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(salesmen ?? []).map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{s.full_name}</td>
                  <td className="px-4 py-3 text-muted">{s.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-3 text-muted">{counts.get(s.id) ?? 0}</td>
                  <td className="px-4 py-3"><SalesmanToggle id={s.id} active={s.active} /></td>
                </tr>
              ))}
              {!salesmen?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">No salesmen yet. Add your first one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
