"use client";

import { useActionState } from "react";
import { updateAccount } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, PasswordInput } from "@/components/ui/input";

export function SettingsForm({ fullName, username, email }: { fullName: string; username: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateAccount, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" defaultValue={fullName} required />
      </div>
      <div>
        <Label htmlFor="username">User ID</Label>
        <Input id="username" name="username" defaultValue={username} placeholder="e.g. Blusip7467" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={email} placeholder="you@gmail.com" />
        <p className="mt-1 text-xs text-muted">Leave blank to keep your current email unchanged.</p>
      </div>
      <div>
        <Label htmlFor="new_password">New password</Label>
        <PasswordInput id="new_password" name="new_password" placeholder="Leave blank to keep current password" />
      </div>

      {state?.error ? (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{state.error}</p>
      ) : state?.success ? (
        <p className="rounded-lg bg-success-bg px-3 py-2 text-sm text-success">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save Changes"}</Button>
    </form>
  );
}
