"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitExpense(_prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const amount = Number(formData.get("amount"));
  if (!amount || amount <= 0) return { error: "Enter a valid amount." };

  const { error } = await supabase.from("expenses").insert({
    salesman_id: user.id,
    expense_date: String(formData.get("expense_date") ?? new Date().toISOString().slice(0, 10)),
    amount,
    note: String(formData.get("note") ?? "") || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/expenses");
  return { error: "" };
}
