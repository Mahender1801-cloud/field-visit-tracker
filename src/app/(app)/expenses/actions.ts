"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { istDateString } from "@/lib/utils";

export async function submitExpense(_prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const amount = Number(formData.get("amount"));
  if (!amount || amount <= 0) return { error: "Enter a valid amount." };

  const expenseId = crypto.randomUUID();
  let receiptPath: string | null = null;

  const receiptFile = formData.get("receipt") as File | null;
  if (receiptFile && receiptFile.size > 0) {
    const ext = receiptFile.name.split(".").pop() || "jpg";
    const path = `${user.id}/expenses/${expenseId}/receipt.${ext}`;
    const { error: uploadError } = await supabase.storage.from("visit-photos").upload(path, receiptFile, {
      upsert: true,
      contentType: receiptFile.type || "image/jpeg",
    });
    if (uploadError) return { error: `Receipt upload failed: ${uploadError.message}` };
    receiptPath = path;
  }

  const { error } = await supabase.from("expenses").insert({
    id: expenseId,
    salesman_id: user.id,
    expense_date: String(formData.get("expense_date") ?? istDateString()),
    amount,
    note: String(formData.get("note") ?? "") || null,
    receipt_path: receiptPath,
  });

  if (error) return { error: error.message };

  revalidatePath("/expenses");
  return { error: "" };
}
