import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Select, Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, formatTime, formatDuration } from "@/lib/utils";
import { VISIT_STATUSES, SHOP_TYPES } from "@/lib/constants";
import { ExportCsvButton } from "./export-button";
import { ExportZipButton } from "./export-zip-button";
import { Button } from "@/components/ui/button";
import { VisitsMapLoader } from "@/components/visits-map-loader";
import { ImageViewerButton } from "@/components/image-viewer";
import type { VisitStatus, ShopType } from "@/lib/types";

export default async function AdminVisitsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("visits").select("*").order("created_at", { ascending: false }).limit(300);
  if (sp.state) query = query.eq("state", sp.state);
  if (sp.city) query = query.ilike("city", `%${sp.city}%`);
  if (sp.status) query = query.eq("status", sp.status as VisitStatus);
  if (sp.type) query = query.eq("type", sp.type as ShopType);
  if (sp.salesman) query = query.eq("salesman_id", sp.salesman);
  if (sp.from) query = query.gte("visit_date", sp.from);
  if (sp.to) query = query.lte("visit_date", sp.to);

  const [{ data: visits }, { data: salesmen }, { data: states }] = await Promise.all([
    query,
    supabase.from("profiles").select("id, full_name").eq("role", "salesman").order("full_name"),
    supabase.from("visits").select("state").not("state", "is", null),
  ]);

  const salesmenMap = new Map((salesmen ?? []).map((s) => [s.id, s.full_name]));
  const stateOptions = Array.from(new Set((states ?? []).map((s) => s.state))).sort();

  const rows = (visits ?? []).map((v) => ({
    ...v,
    salesman_name: salesmenMap.get(v.salesman_id) ?? "—",
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Visits</h1>
          <p className="text-sm text-muted">{rows.length} visit{rows.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton rows={rows} />
          <ExportZipButton />
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          <form className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7" method="get">
            <Select name="salesman" defaultValue={sp.salesman ?? ""}>
              <option value="">All Salesmen</option>
              {(salesmen ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </Select>
            <Select name="state" defaultValue={sp.state ?? ""}>
              <option value="">All States</option>
              {stateOptions.map((s) => (
                <option key={s} value={s!}>{s}</option>
              ))}
            </Select>
            <Input name="city" placeholder="City" defaultValue={sp.city ?? ""} />
            <Select name="status" defaultValue={sp.status ?? ""}>
              <option value="">All Status</option>
              {VISIT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Select name="type" defaultValue={sp.type ?? ""}>
              <option value="">All Types</option>
              {SHOP_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            <Input name="from" type="date" defaultValue={sp.from ?? ""} />
            <Input name="to" type="date" defaultValue={sp.to ?? ""} />
            <div className="col-span-2 flex gap-2 md:col-span-4 lg:col-span-7">
              <Button type="submit" size="sm">Apply Filters</Button>
              <a href="/admin/visits"><Button type="button" variant="outline" size="sm">Clear</Button></a>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <VisitsMapLoader
            visits={rows
              .filter((v) => v.latitude != null && v.longitude != null)
              .map((v) => ({
                id: v.id,
                latitude: v.latitude!,
                longitude: v.longitude!,
                shopkeeper_name: v.shopkeeper_name,
                salesman_name: v.salesman_name,
                status: v.status,
              }))}
          />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted-bg text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Salesman</th>
                <th className="px-4 py-3">Shop</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Photos</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted-bg/50">
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(v.visit_date)}<br /><span className="text-xs">{formatTime(v.created_at)}</span></td>
                  <td className="px-4 py-3 font-medium text-foreground">{v.salesman_name}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{v.shopkeeper_name}</p>
                    {v.phone && <p className="text-xs text-muted">{v.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted">{[v.area, v.city, v.state].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-muted">{v.type}</td>
                  <td className="px-4 py-3 text-muted">{formatDuration(v.created_at, v.punch_out_at)}</td>
                  <td className="px-4 py-3">{v.punch_out_at ? <StatusBadge status={v.status} /> : <StatusBadge status="In Progress" />}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {v.selfie_path && <ImageViewerButton path={v.selfie_path} label="Selfie" />}
                      {v.visiting_card_path && <ImageViewerButton path={v.visiting_card_path} label="Card" />}
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted">No visits match these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
