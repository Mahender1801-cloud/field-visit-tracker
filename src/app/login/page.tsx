import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-sm">
            FT
          </div>
          <h1 className="text-xl font-semibold text-foreground">FieldTrack</h1>
          <p className="mt-1 text-sm text-muted">Sign in to log or review sales visits</p>
        </div>

        <LoginForm deactivated={sp.deactivated === "1"} />

        <p className="mt-6 text-center text-xs text-muted">
          No account? Ask your admin to add you as a salesman.
        </p>
      </div>
    </main>
  );
}
