import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PunchCard } from "@/components/punch-card";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";

export default async function HomePage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: openPunch }, { data: todaysVisits }] = await Promise.all([
    supabase
      .from("punches")
      .select("*")
      .eq("salesman_id", profile.id)
      .is("punch_out_at", null)
      .maybeSingle(),
    supabase
      .from("visits")
      .select("*")
      .eq("salesman_id", profile.id)
      .eq("visit_date", today)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-5">
      <PunchCard openPunch={openPunch ?? null} />

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-2xl font-semibold text-foreground">{todaysVisits?.length ?? 0}</p>
            <p className="text-xs text-muted">Visits today</p>
          </CardContent>
        </Card>
        <Link href="/visit/new">
          <Card className="h-full bg-primary text-primary-foreground">
            <CardContent className="flex h-full flex-col justify-center py-4">
              <p className="text-sm font-medium">+ Log a Visit</p>
              <p className="text-xs opacity-80">Shop details & photo</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Today&apos;s visits</h2>
        {!todaysVisits?.length ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
            No visits logged yet today.
          </p>
        ) : (
          <div className="space-y-2">
            {todaysVisits.map((v) => (
              <Link href={`/history`} key={v.id}>
                <Card>
                  <CardContent className="flex items-center justify-between gap-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted-bg">
                        <Store size={16} className="text-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{v.shopkeeper_name}</p>
                        <p className="text-xs text-muted">
                          {[v.city, v.area].filter(Boolean).join(", ") || "—"} · {formatTime(v.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={v.status} />
                      <ChevronRight size={16} className="text-muted" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
