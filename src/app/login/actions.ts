"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const GENERIC_ERROR = "Invalid login. Check your Email / User ID and password.";

export async function signIn(_prevState: { error: string } | null, formData: FormData) {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    return { error: "Enter your Email or User ID and password." };
  }

  let email = identifier;

  if (!identifier.includes("@")) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("username", identifier)
      .maybeSingle();

    if (!profile) return { error: GENERIC_ERROR };

    const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(profile.id);
    if (userErr || !userRes.user?.email) return { error: GENERIC_ERROR };
    email = userRes.user.email;
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !authData.user) {
    return { error: GENERIC_ERROR };
  }

  const { data: profile } = await supabase.from("profiles").select("active").eq("id", authData.user.id).single();

  if (!profile?.active) {
    await supabase.auth.signOut();
    return { error: "This account has been deactivated. Contact your admin." };
  }

  redirect("/");
}
