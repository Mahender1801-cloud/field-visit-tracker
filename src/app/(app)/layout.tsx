import { requireProfile } from "@/lib/auth";
import { SalesmanNav } from "@/components/salesman-nav";
import { signOut } from "./actions";
import { LogOut } from "lucide-react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{profile.full_name}</p>
            <p className="text-xs text-muted">Salesman</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground">
              <LogOut size={14} /> Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-24 pt-4">{children}</main>

      <SalesmanNav />
    </div>
  );
}
