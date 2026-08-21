import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { AddSalesmanForm } from "./add-salesman-form";
import { SalesmanToggle } from "./salesman-toggle";
import { EditSalesmanModal } from "./edit-salesman-modal";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

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
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Total Visits</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Edit</th>
              </tr>
            </thead>
            <tbody>
              {(salesmen ?? []).map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted-bg/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/salesmen/${s.id}`} className="flex items-center gap-2.5 font-medium text-foreground hover:text-primary">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {s.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                      <span className="hover:underline">{s.full_name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{s.username ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{s.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-3 text-muted">{counts.get(s.id) ?? 0}</td>
                  <td className="px-4 py-3"><SalesmanToggle id={s.id} active={s.active} /></td>
                  <td className="px-4 py-3"><EditSalesmanModal salesman={s} /></td>
                </tr>
              ))}
              {!salesmen?.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">No salesmen yet. Add your first one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
