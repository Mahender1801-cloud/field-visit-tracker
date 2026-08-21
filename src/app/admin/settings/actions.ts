"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateAccount(_prevState: { error: string; success?: string } | null, formData: FormData) {
  const profile = await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim();
  const newPassword = String(formData.get("new_password") ?? "");

  if (!fullName) return { error: "Name is required." };
  if (email && !email.includes("@")) return { error: "Enter a valid email address." };
  if (username && /\s/.test(username)) return { error: "User ID can't contain spaces." };
  if (newPassword && newPassword.length < 6) return { error: "New password must be at least 6 characters." };

  const admin = createAdminClient();

  if (username) {
    const { data: taken } = await admin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", profile.id)
      .maybeSingle();
    if (taken) return { error: "That User ID is already taken." };
  }

  const supabase = await createClient();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName, username })
    .eq("id", profile.id);

  if (profileError) return { error: profileError.message };

  if (email || newPassword) {
    const authUpdate: { email?: string; password?: string } = {};
    if (email) authUpdate.email = email;
    if (newPassword) authUpdate.password = newPassword;

    const { error: authError } = await admin.auth.admin.updateUserById(profile.id, {
      ...authUpdate,
      email_confirm: true,
    });
    if (authError) return { error: authError.message };
  }

  revalidatePath("/admin/settings");
  return { error: "", success: "Account updated." };
}
