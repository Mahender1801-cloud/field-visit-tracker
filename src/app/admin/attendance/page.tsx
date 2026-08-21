import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Select, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime, formatDuration } from "@/lib/utils";
import { MapPin } from "lucide-react";

function mapLink(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("punches").select("*").order("punch_in_at", { ascending: false }).limit(200);
  if (sp.salesman) query = query.eq("salesman_id", sp.salesman);
  if (sp.from) query = query.gte("punch_in_at", `${sp.from}T00:00:00`);
  if (sp.to) query = query.lte("punch_in_at", `${sp.to}T23:59:59`);

  const [{ data: punches }, { data: salesmen }] = await Promise.all([
    query,
    supabase.from("profiles").select("id, full_name").eq("role", "salesman").order("full_name"),
  ]);

  const nameMap = new Map((salesmen ?? []).map((s) => [s.id, s.full_name]));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Attendance</h1>
        <p className="text-sm text-muted">{punches?.length ?? 0} punch record{punches?.length === 1 ? "" : "s"}</p>
      </div>

      <Card>
        <CardContent className="py-4">
          <form className="grid grid-cols-2 gap-3 md:grid-cols-4" method="get">
            <Select name="salesman" defaultValue={sp.salesman ?? ""}>
              <option value="">All Salesmen</option>
              {(salesmen ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </Select>
            <Input name="from" type="date" defaultValue={sp.from ?? ""} />
            <Input name="to" type="date" defaultValue={sp.to ?? ""} />
            <div className="flex gap-2">
              <Button type="submit" size="sm">Apply</Button>
              <a href="/admin/attendance"><Button type="button" variant="outline" size="sm">Clear</Button></a>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted-bg text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Salesman</th>
                <th className="px-4 py-3">Punch In</th>
                <th className="px-4 py-3">Punch Out</th>
                <th className="px-4 py-3">Duration</th>
              </tr>
            </thead>
            <tbody>
              {(punches ?? []).map((p) => {
                const inLink = mapLink(p.punch_in_lat, p.punch_in_lng);
                const outLink = mapLink(p.punch_out_lat, p.punch_out_lng);
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted-bg/50">
                    <td className="px-4 py-3 text-muted">{formatDate(p.punch_in_at)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{nameMap.get(p.salesman_id) ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">
                      {formatTime(p.punch_in_at)}
                      {inLink && (
                        <a href={inLink} target="_blank" rel="noreferrer" className="ml-1.5 inline-flex items-center gap-0.5 text-primary hover:underline">
                          <MapPin size={11} /> map
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {p.punch_out_at ? formatTime(p.punch_out_at) : <span className="text-danger">Still on duty</span>}
                      {outLink && (
                        <a href={outLink} target="_blank" rel="noreferrer" className="ml-1.5 inline-flex items-center gap-0.5 text-primary hover:underline">
                          <MapPin size={11} /> map
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDuration(p.punch_in_at, p.punch_out_at)}</td>
                  </tr>
                );
              })}
              {!punches?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">No attendance records match these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
