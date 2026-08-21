"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Visit, VisitStatus } from "@/lib/types";

export async function punchOutOfShop(_prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const visitId = String(formData.get("visit_id") ?? "");
  const status = (formData.get("status") as VisitStatus) || "New";
  const feedback = String(formData.get("feedback") ?? "") || null;
  const lat = formData.get("latitude");
  const lng = formData.get("longitude");

  if (!visitId) return { error: "Missing visit." };

  const cardFile = formData.get("visiting_card") as File | null;
  let visitingCardPath: string | null = null;

  if (cardFile && cardFile.size > 0) {
    const ext = cardFile.name.split(".").pop() || "jpg";
    const path = `${user.id}/${visitId}/card.${ext}`;
    const { error: uploadError } = await supabase.storage.from("visit-photos").upload(path, cardFile, {
      upsert: true,
      contentType: cardFile.type || "image/jpeg",
    });
    if (uploadError) return { error: `Visiting card upload failed: ${uploadError.message}` };
    visitingCardPath = path;
  }

  const update: Partial<Visit> = {
    status,
    feedback,
    punch_out_at: new Date().toISOString(),
    punch_out_lat: lat ? Number(lat) : null,
    punch_out_lng: lng ? Number(lng) : null,
  };
  if (visitingCardPath) update.visiting_card_path = visitingCardPath;

  const { error } = await supabase
    .from("visits")
    .update(update)
    .eq("id", visitId)
    .eq("salesman_id", user.id)
    .is("punch_out_at", null);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/history");
  redirect("/history?saved=1");
}
