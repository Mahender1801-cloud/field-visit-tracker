"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function punchIn(lat: number | null, lng: number | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("punches").insert({
    salesman_id: user.id,
    punch_in_lat: lat,
    punch_in_lng: lng,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function punchOut(punchId: string, lat: number | null, lng: number | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("punches")
    .update({ punch_out_at: new Date().toISOString(), punch_out_lat: lat, punch_out_lng: lng })
    .eq("id", punchId)
    .eq("salesman_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}
