import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PunchCard } from "@/components/punch-card";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatTime, formatDuration, istDateString } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight, Store, MapPin } from "lucide-react";

export default async function HomePage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const today = istDateString();

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

  const openVisit = todaysVisits?.find((v) => !v.punch_out_at) ?? null;

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

        {openVisit ? (
          <Link href={`/visit/${openVisit.id}/punch-out`}>
            <Card className="h-full bg-danger text-white">
              <CardContent className="flex h-full flex-col justify-center py-4">
                <p className="truncate text-sm font-medium">At {openVisit.shopkeeper_name}</p>
                <p className="text-xs opacity-90">Punch out →</p>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Link href="/visit/new">
            <Card className="h-full bg-primary text-primary-foreground">
              <CardContent className="flex h-full flex-col justify-center py-4">
                <p className="text-sm font-medium">+ Punch In</p>
                <p className="text-xs opacity-80">Start a shop visit</p>
              </CardContent>
            </Card>
          </Link>
        )}
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
              <Link href={v.punch_out_at ? "/history" : `/visit/${v.id}/punch-out`} key={v.id}>
                <Card className={!v.punch_out_at ? "border-danger/40" : undefined}>
                  <CardContent className="flex items-center justify-between gap-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted-bg">
                        <Store size={16} className="text-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{v.shopkeeper_name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted">
                          {v.punch_out_at ? (
                            <>{[v.city, v.area].filter(Boolean).join(", ") || "—"} · {formatTime(v.created_at)} · {formatDuration(v.created_at, v.punch_out_at)}</>
                          ) : (
                            <><MapPin size={11} /> Still there · {formatDuration(v.created_at, null)}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {v.punch_out_at ? <StatusBadge status={v.status} /> : <StatusBadge status="In Progress" />}
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
