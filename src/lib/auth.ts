import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Profile } from "@/lib/types";

// Fast path: middleware already resolved the user + profile for this
// request and forwarded them as headers, so pages don't need to repeat
// that round trip. Falls back to a real query if headers are missing.
export async function requireProfile(): Promise<Profile> {
  const h = await headers();
  const id = h.get("x-user-id");
  const role = h.get("x-profile-role");
  const nameHeader = h.get("x-profile-name");

  if (id && role && nameHeader) {
    const usernameHeader = h.get("x-profile-username");
    return {
      id,
      role: role as Profile["role"],
      full_name: decodeURIComponent(nameHeader),
      username: usernameHeader ? decodeURIComponent(usernameHeader) : null,
      phone: null,
      active: true,
      created_at: "",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/");
  return profile;
}
