"use client";

import { useActionState } from "react";
import { signIn } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function LoginForm({ deactivated }: { deactivated: boolean }) {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <>
      {deactivated && (
        <p className="mb-4 rounded-lg bg-warning-bg px-3 py-2 text-center text-sm text-warning">
          That account has been deactivated. Contact your admin.
        </p>
      )}
      <Card>
        <CardContent className="pt-5">
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="identifier">Email or User ID</Label>
              <Input id="identifier" name="identifier" autoComplete="username" required placeholder="you@company.com or User ID" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{state.error}</p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={pending}>
              {pending ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
