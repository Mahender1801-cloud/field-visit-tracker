"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ShopType, VisitStatus } from "@/lib/types";

async function uploadPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  visitId: string,
  file: File | null,
  label: "selfie" | "card",
) {
  if (!file || file.size === 0) return null;
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${visitId}/${label}.${ext}`;
  const { error } = await supabase.storage.from("visit-photos").upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw new Error(`${label} upload failed: ${error.message}`);
  return path;
}

export async function submitVisit(_prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const shopkeeperName = String(formData.get("shopkeeper_name") ?? "").trim();
  if (!shopkeeperName) return { error: "Shop / shopkeeper name is required." };

  const visitId = crypto.randomUUID();
  const lat = formData.get("latitude");
  const lng = formData.get("longitude");

  try {
    const selfiePath = await uploadPhoto(supabase, user.id, visitId, formData.get("selfie") as File, "selfie");
    const cardPath = await uploadPhoto(supabase, user.id, visitId, formData.get("visiting_card") as File, "card");

    const { error } = await supabase.from("visits").insert({
      id: visitId,
      salesman_id: user.id,
      shopkeeper_name: shopkeeperName,
      phone: String(formData.get("phone") ?? "") || null,
      type: (formData.get("type") as ShopType) || "Retailer",
      state: String(formData.get("state") ?? "") || null,
      city: String(formData.get("city") ?? "") || null,
      area: String(formData.get("area") ?? "") || null,
      status: (formData.get("status") as VisitStatus) || "New",
      feedback: String(formData.get("feedback") ?? "") || null,
      latitude: lat ? Number(lat) : null,
      longitude: lng ? Number(lng) : null,
      selfie_path: selfiePath,
      visiting_card_path: cardPath,
    });

    if (error) return { error: error.message };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save visit." };
  }

  revalidatePath("/");
  revalidatePath("/history");
  redirect("/history?saved=1");
}
