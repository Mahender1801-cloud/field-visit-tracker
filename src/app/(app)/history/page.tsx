import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime, formatDuration, cn } from "@/lib/utils";
import { Phone, MapPin, Clock } from "lucide-react";
import Link from "next/link";

type Period = "today" | "week" | "month" | "all";

function periodRange(period: Period) {
  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  if (period === "today") return { from: iso(now), to: iso(now) };
  if (period === "week") {
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    return { from: iso(monday), to: iso(now) };
  }
  if (period === "month") {
    return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(now) };
  }
  return null;
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const sp = await searchParams;

  const period = (sp.period as Period) || "all";
  const customFrom = sp.from;
  const customTo = sp.to;
  const range = customFrom || customTo ? { from: customFrom, to: customTo } : periodRange(period);

  let query = supabase
    .from("visits")
    .select("*")
    .eq("salesman_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (range?.from) query = query.gte("visit_date", range.from);
  if (range?.to) query = query.lte("visit_date", range.to);

  const { data: visits } = await query;

  const tabs: { key: Period; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "all", label: "All Time" },
  ];
  const usingCustomRange = !!(customFrom || customTo);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-foreground">Visit History</h1>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <a
            key={t.key}
            href={`/history?period=${t.key}`}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
              !usingCustomRange && period === t.key ? "bg-primary text-primary-foreground" : "bg-muted-bg text-muted",
            )}
          >
            {t.label}
          </a>
        ))}
      </div>

      <details className="rounded-xl border border-border bg-card px-3 py-2" open={usingCustomRange}>
        <summary className="cursor-pointer text-xs font-medium text-muted">Custom date range</summary>
        <form method="get" className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs text-muted">From</label>
            <Input name="from" type="date" defaultValue={customFrom ?? ""} className="h-9 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">To</label>
            <Input name="to" type="date" defaultValue={customTo ?? ""} className="h-9 text-sm" />
          </div>
          <Button type="submit" size="sm">Apply</Button>
        </form>
      </details>

      {!visits?.length ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          No visits logged in this period.
        </p>
      ) : (
        <div className="space-y-3">
          {visits.map((v) => {
            const card = (
              <Card className={!v.punch_out_at ? "border-danger/40" : undefined}>
                <CardContent className="space-y-2 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{v.shopkeeper_name}</p>
                      <p className="text-xs text-muted">
                        {formatDate(v.visit_date)} · {formatTime(v.created_at)} · {v.type}
                      </p>
                    </div>
                    {v.punch_out_at ? <StatusBadge status={v.status} /> : <StatusBadge status="In Progress" />}
                  </div>

                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <Clock size={12} /> {formatDuration(v.created_at, v.punch_out_at)} at this shop
                  </p>

                  {(v.city || v.area || v.state) && (
                    <p className="flex items-center gap-1.5 text-xs text-muted">
                      <MapPin size={12} /> {[v.area, v.city, v.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {v.phone && (
                    <p className="flex items-center gap-1.5 text-xs text-muted">
                      <Phone size={12} /> {v.phone}
                    </p>
                  )}
                  {v.feedback && <p className="text-sm text-foreground/90">{v.feedback}</p>}
                </CardContent>
              </Card>
            );
            return v.punch_out_at ? (
              <div key={v.id}>{card}</div>
            ) : (
              <Link href={`/visit/${v.id}/punch-out`} key={v.id}>{card}</Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
