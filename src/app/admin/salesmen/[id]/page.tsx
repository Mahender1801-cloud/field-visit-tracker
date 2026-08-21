import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { SalesmanToggle } from "../salesman-toggle";
import { EditSalesmanModal } from "../edit-salesman-modal";
import { ImageViewerButton } from "@/components/image-viewer";
import { formatDate, formatTime, formatCurrency, formatDuration, istDateString, toIST, cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, Phone, MapPin, Clock } from "lucide-react";

export default async function SalesmanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: salesman } = await supabase.from("profiles").select("*").eq("id", id).eq("role", "salesman").maybeSingle();
  if (!salesman) notFound();

  const admin = createAdminClient();
  const { data: userRes } = await admin.auth.admin.getUserById(id);
  const emailRaw = userRes.user?.email ?? "";
  const email = emailRaw.endsWith("@fieldtrack.internal") ? "" : emailRaw;

  const now = new Date();
  const weekAgo = istDateString(new Date(now.getTime() - 6 * 86400000));
  const istNow = toIST(now);
  const monthAgo = `${istNow.getUTCFullYear()}-${String(istNow.getUTCMonth() + 1).padStart(2, "0")}-01`;

  const [{ data: visits }, { data: expenses }] = await Promise.all([
    supabase.from("visits").select("*").eq("salesman_id", id).order("created_at", { ascending: false }).limit(100),
    supabase.from("expenses").select("*").eq("salesman_id", id).order("expense_date", { ascending: false }).limit(50),
  ]);

  const all = visits ?? [];
  const thisWeek = all.filter((v) => v.visit_date >= weekAgo).length;
  const thisMonth = all.filter((v) => v.visit_date >= monthAgo).length;
  const pendingExpenses = (expenses ?? []).filter((e) => e.status === "Pending").reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-5">
      <Link href="/admin/salesmen" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ChevronLeft size={16} /> Back to Salesmen
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{salesman.full_name}</h1>
            <SalesmanToggle id={salesman.id} active={salesman.active} />
          </div>
          <p className="text-sm text-muted">
            {email || <span className="italic">no email set</span>}
            {salesman.phone ? ` · ${salesman.phone}` : ""}
            {salesman.username ? ` · User ID: ${salesman.username}` : ""} · Joined {formatDate(salesman.created_at)}
          </p>
        </div>
        <EditSalesmanModal salesman={salesman} email={email} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="py-5"><p className="text-2xl font-semibold text-foreground">{all.length}</p><p className="text-xs text-muted">Total visits</p></CardContent></Card>
        <Card><CardContent className="py-5"><p className="text-2xl font-semibold text-foreground">{thisWeek}</p><p className="text-xs text-muted">This week</p></CardContent></Card>
        <Card><CardContent className="py-5"><p className="text-2xl font-semibold text-foreground">{thisMonth}</p><p className="text-xs text-muted">This month</p></CardContent></Card>
        <Card><CardContent className="py-5"><p className="text-2xl font-semibold text-foreground">{formatCurrency(pendingExpenses)}</p><p className="text-xs text-muted">Pending expenses</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Visit History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {!all.length ? (
            <p className="py-8 text-center text-sm text-muted">No visits logged yet.</p>
          ) : (
            all.map((v) => (
              <div key={v.id} className={cn("rounded-xl border p-3.5", v.punch_out_at ? "border-border" : "border-danger/40")}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{v.shopkeeper_name}</p>
                    <p className="text-xs text-muted">{formatDate(v.visit_date)} · {formatTime(v.created_at)} · {v.type}</p>
                  </div>
                  {v.punch_out_at ? <StatusBadge status={v.status} /> : <StatusBadge status="In Progress" />}
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted"><Clock size={11} /> {formatDuration(v.created_at, v.punch_out_at)} at this shop</p>
                {(v.city || v.area || v.state) && (
                  <p className="flex items-center gap-1.5 text-xs text-muted"><MapPin size={11} /> {[v.area, v.city, v.state].filter(Boolean).join(", ")}</p>
                )}
                {v.phone && <p className="flex items-center gap-1.5 text-xs text-muted"><Phone size={11} /> {v.phone}</p>}
                {v.feedback && <p className="mt-1 text-sm text-foreground/90">{v.feedback}</p>}
                {(v.selfie_path || v.visiting_card_path) && (
                  <div className="mt-2 flex gap-3">
                    {v.selfie_path && <ImageViewerButton path={v.selfie_path} label="Selfie" />}
                    {v.visiting_card_path && <ImageViewerButton path={v.visiting_card_path} label="Card" />}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
