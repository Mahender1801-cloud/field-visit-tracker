"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function getPhotoUrl(path: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("visit-photos").createSignedUrl(path, 300);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
