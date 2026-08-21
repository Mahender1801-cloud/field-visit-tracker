import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PunchOutForm } from "./punch-out-form";

export default async function PunchOutPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data: visit } = await supabase.from("visits").select("*").eq("id", id).eq("salesman_id", profile.id).maybeSingle();
  if (!visit) notFound();
  if (visit.punch_out_at) redirect("/history");

  return <PunchOutForm visit={visit} />;
}
