"use client";

import { useActionState, useRef, useEffect } from "react";
import { submitExpense } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PhotoCapture } from "@/components/photo-capture";
import { istDateString } from "@/lib/utils";

export function ExpenseForm() {
  const [state, formAction, pending] = useActionState(submitExpense, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && !state.error) formRef.current?.reset();
  }, [state]);

  return (
    <Card>
      <CardContent className="py-4">
        <form ref={formRef} action={formAction} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="expense_date">Date</Label>
              <Input id="expense_date" name="expense_date" type="date" defaultValue={istDateString()} required />
            </div>
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" name="amount" type="number" min="1" step="0.01" required placeholder="0" />
            </div>
          </div>
          <div>
            <Label htmlFor="note">Note</Label>
            <Input id="note" name="note" placeholder="e.g. fuel, toll" />
          </div>
          <div className="w-1/2 pr-1.5">
            <Label>Bill / receipt (optional)</Label>
            <PhotoCapture name="receipt" label="Add photo" capture="environment" />
          </div>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Submitting…" : "Submit Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
