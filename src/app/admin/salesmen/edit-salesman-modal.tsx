"use client";

import { useActionState, useEffect, useState } from "react";
import { updateSalesman } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, PasswordInput } from "@/components/ui/input";
import { Pencil, X } from "lucide-react";
import type { Profile } from "@/lib/types";

export function EditSalesmanModal({ salesman, email }: { salesman: Profile; email: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateSalesman, null);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
        <Pencil size={12} /> Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Edit Salesman</h3>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground"><X size={18} /></button>
            </div>

            <form action={formAction} className="space-y-3">
              <input type="hidden" name="id" value={salesman.id} />
              <div>
                <Label htmlFor={`edit_full_name_${salesman.id}`}>Full name</Label>
                <Input id={`edit_full_name_${salesman.id}`} name="full_name" defaultValue={salesman.full_name} required />
              </div>
              <div>
                <Label htmlFor={`edit_phone_${salesman.id}`}>Phone</Label>
                <Input id={`edit_phone_${salesman.id}`} name="phone" type="tel" defaultValue={salesman.phone ?? ""} />
              </div>
              <div>
                <Label htmlFor={`edit_email_${salesman.id}`}>Email</Label>
                <Input id={`edit_email_${salesman.id}`} name="email" type="email" defaultValue={email} placeholder="salesman@gmail.com" />
              </div>
              <div>
                <Label htmlFor={`edit_username_${salesman.id}`}>User ID</Label>
                <Input id={`edit_username_${salesman.id}`} name="username" defaultValue={salesman.username ?? ""} />
              </div>
              <div>
                <Label htmlFor={`edit_password_${salesman.id}`}>Reset password</Label>
                <PasswordInput id={`edit_password_${salesman.id}`} name="new_password" placeholder="Leave blank to keep current" />
              </div>

              {state?.error && <p className="text-sm text-danger">{state.error}</p>}

              <Button type="submit" className="w-full" disabled={pending}>{pending ? "Saving…" : "Save Changes"}</Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
