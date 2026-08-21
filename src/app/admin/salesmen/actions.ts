"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createSalesman(_prevState: { error: string } | null, formData: FormData) {
  await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || password.length < 6) {
    return { error: "Name, email, and a password of at least 6 characters are required." };
  }

  const admin = createAdminClient();
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
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: profileError.message };
  }

  revalidatePath("/admin/salesmen");
  return { error: "" };
}

export async function setSalesmanActive(id: string, active: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/salesmen");
}
