"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { createSalesman } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, PasswordInput } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

export function AddSalesmanForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createSalesman, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} /> Add Salesman
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>New Salesman Login</CardTitle>
        <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground"><X size={18} /></button>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="full_name">Full name *</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="username">User ID</Label>
            <Input id="username" name="username" placeholder="optional, for login without email" />
          </div>
          <div>
            <Label htmlFor="password">Temporary password *</Label>
            <PasswordInput id="password" name="password" minLength={6} required placeholder="min. 6 characters" />
          </div>
          {state?.error && <p className="md:col-span-2 text-sm text-danger">{state.error}</p>}
          <div className="md:col-span-2">
            <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create Login"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
