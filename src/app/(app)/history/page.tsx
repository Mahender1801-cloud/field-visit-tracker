import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { Phone, MapPin } from "lucide-react";

export default async function HistoryPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: visits } = await supabase
    .from("visits")
    .select("*")
    .eq("salesman_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-foreground">Visit History</h1>

      {!visits?.length ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          No visits logged yet.
        </p>
      ) : (
        <div className="space-y-3">
          {visits.map((v) => (
            <Card key={v.id}>
              <CardContent className="space-y-2 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{v.shopkeeper_name}</p>
                    <p className="text-xs text-muted">
                      {formatDate(v.visit_date)} · {formatTime(v.created_at)} · {v.type}
                    </p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>

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
          ))}
        </div>
      )}
    </div>
  );
}
