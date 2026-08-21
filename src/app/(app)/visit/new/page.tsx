import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewVisitForm } from "./new-visit-form";

export default async function NewVisitPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: openVisit } = await supabase
    .from("visits")
    .select("id")
    .eq("salesman_id", profile.id)
    .is("punch_out_at", null)
    .maybeSingle();

  if (openVisit) redirect(`/visit/${openVisit.id}/punch-out`);

  return <NewVisitForm />;
}
