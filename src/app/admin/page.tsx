import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisitTrendChart, StateBarChart, StatusPieChart } from "@/components/charts";
import { formatDate } from "@/lib/utils";
import { Users, Store, CalendarCheck, TrendingUp } from "lucide-react";

const DAY_MS = 86400000;

export default async function AdminDashboard() {
  const supabase = await createClient();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 6 * DAY_MS).toISOString().slice(0, 10);
  const fortnightAgo = new Date(now.getTime() - 13 * DAY_MS).toISOString().slice(0, 10);

  const [{ data: visits }, { data: profiles }] = await Promise.all([
    supabase.from("visits").select("*").gte("visit_date", fortnightAgo).order("visit_date", { ascending: true }),
    supabase.from("profiles").select("*").eq("role", "salesman"),
  ]);

  const all = visits ?? [];
  const todayVisits = all.filter((v) => v.visit_date === todayStr);
  const weekVisits = all.filter((v) => v.visit_date >= weekAgo);
  const activeSalesmen = new Set(weekVisits.map((v) => v.salesman_id)).size;
  const uniqueShops = new Set(all.map((v) => v.shopkeeper_name.trim().toLowerCase())).size;

  const trend: Record<string, number> = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date(now.getTime() - (13 - i) * DAY_MS).toISOString().slice(0, 10);
    trend[d] = 0;
  }
  all.forEach((v) => {
    if (v.visit_date in trend) trend[v.visit_date]++;
  });
  const trendData = Object.entries(trend).map(([date, visits]) => ({ date: formatDate(date).replace(/, \d{4}$/, ""), visits }));

  const stateCounts: Record<string, number> = {};
  all.forEach((v) => {
    const s = v.state || "Unknown";
    stateCounts[s] = (stateCounts[s] || 0) + 1;
  });
  const stateData = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([state, visits]) => ({ state, visits }));

  const statusCounts: Record<string, number> = {};
  all.forEach((v) => {
    statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const kpis = [
    { label: "Today's Visits", value: todayVisits.length, icon: CalendarCheck },
    { label: "This Week", value: weekVisits.length, icon: TrendingUp },
    { label: "Active Salesmen", value: activeSalesmen, sub: `of ${profiles?.length ?? 0} total`, icon: Users },
    { label: "Shops Visited", value: uniqueShops, sub: "unique, last 14 days", icon: Store },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted">Sales team activity overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, sub, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="py-5">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon size={17} />
              </div>
              <p className="text-2xl font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted">{label}{sub ? ` · ${sub}` : ""}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visit Trend (14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <VisitTrendChart data={trendData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visit Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length ? (
              <>
                <StatusPieChart data={statusData} />
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {statusData.map((s, i) => (
                    <span key={s.name} className="flex items-center gap-1.5 text-xs text-muted">
                      <span className="h-2 w-2 rounded-full" style={{ background: ["#2554ec", "#12805c", "#b45309", "#d92d20", "#7c3aed", "#0891b2"][i % 6] }} />
                      {s.name} ({s.value})
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-16 text-center text-sm text-muted">No visits yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visits by State</CardTitle>
        </CardHeader>
        <CardContent>
          {stateData.length ? <StateBarChart data={stateData} /> : <p className="py-16 text-center text-sm text-muted">No visits yet</p>}
        </CardContent>
      </Card>
    </div>
  );
}
