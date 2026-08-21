"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function usernameTaken(admin: ReturnType<typeof createAdminClient>, username: string, excludeId?: string) {
  let query = admin.from("profiles").select("id").eq("username", username);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.maybeSingle();
  return !!data;
}

export async function createSalesman(_prevState: { error: string } | null, formData: FormData) {
  await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || password.length < 6) {
    return { error: "Name, email, and a password of at least 6 characters are required." };
  }
  if (username && /\s/.test(username)) return { error: "User ID can't contain spaces." };

  const admin = createAdminClient();

  if (username && (await usernameTaken(admin, username))) {
    return { error: "That User ID is already taken." };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Could not create the login." };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    role: "salesman",
    full_name: fullName,
    phone: phone || null,
    username,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: profileError.message };
  }

  revalidatePath("/admin/salesmen");
  return { error: "" };
}

export async function updateSalesman(_prevState: { error: string; success?: string } | null, formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim() || null;
  const newPassword = String(formData.get("new_password") ?? "");

  if (!id || !fullName) return { error: "Name is required." };
  if (username && /\s/.test(username)) return { error: "User ID can't contain spaces." };
  if (newPassword && newPassword.length < 6) return { error: "New password must be at least 6 characters." };

  const admin = createAdminClient();

  if (username && (await usernameTaken(admin, username, id))) {
    return { error: "That User ID is already taken." };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null, username })
    .eq("id", id);

  if (profileError) return { error: profileError.message };

  if (newPassword) {
    const { error: pwError } = await admin.auth.admin.updateUserById(id, { password: newPassword });
    if (pwError) return { error: pwError.message };
  }

  revalidatePath("/admin/salesmen");
  revalidatePath(`/admin/salesmen/${id}`);
  return { error: "", success: "Salesman updated." };
}

export async function setSalesmanActive(id: string, active: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/salesmen");
  revalidatePath(`/admin/salesmen/${id}`);
}
