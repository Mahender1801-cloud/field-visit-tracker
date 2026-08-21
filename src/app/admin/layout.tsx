import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { AdminMobileNav } from "@/components/admin-mobile-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav name={profile.full_name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileNav />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
