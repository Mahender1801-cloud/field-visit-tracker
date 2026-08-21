"use server";

import { createClient } from "@/lib/supabase/server";

// Storage RLS (owner or admin) is the source of truth for who can view a
// given photo — this just proxies through the authenticated client so a
// signed URL is only ever issued to someone allowed to see it.
export async function getSignedPhotoUrl(path: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("visit-photos").createSignedUrl(path, 300);
  if (error || !data) throw new Error("Not authorized or file not found.");
  return data.signedUrl;
}
