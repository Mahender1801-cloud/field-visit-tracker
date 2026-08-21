"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ExpenseStatus } from "@/lib/types";

export async function reviewExpense(id: string, status: ExpenseStatus) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("expenses")
    .update({ status, reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/expenses");
}
