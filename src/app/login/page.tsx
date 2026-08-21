"use client";

import { useActionState } from "react";
import { signIn } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
            FT
          </div>
          <h1 className="text-xl font-semibold text-foreground">FieldTrack</h1>
          <p className="mt-1 text-sm text-muted">Sign in to log or review sales visits</p>
        </div>

        <Card>
          <CardContent className="pt-5">
            <form action={formAction} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="username" required placeholder="you@company.com" />
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

        <p className="mt-6 text-center text-xs text-muted">
          No account? Ask your admin to add you as a salesman.
        </p>
      </div>
    </main>
  );
}
