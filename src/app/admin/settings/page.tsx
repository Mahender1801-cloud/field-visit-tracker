import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsForm } from "./settings-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminSettingsPage() {
  const profile = await requireAdmin();
  const admin = createAdminClient();
  const { data: userRes } = await admin.auth.admin.getUserById(profile.id);
  const currentEmail = userRes.user?.email ?? "";
  const isPlaceholderEmail = currentEmail.endsWith("@fieldtrack.internal");

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Account Settings</h1>
        <p className="text-sm text-muted">Manage your admin login</p>
      </div>

      {isPlaceholderEmail && (
        <div className="rounded-xl border border-warning-bg bg-warning-bg px-4 py-3 text-sm text-warning">
          You're using a placeholder email. Add your real Gmail below so you can also sign in with it — your User ID keeps working either way.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Login Details</CardTitle>
          <CardDescription>You can sign in with your email or your User ID.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm
            fullName={profile.full_name}
            username={profile.username ?? ""}
            email={isPlaceholderEmail ? "" : currentEmail}
          />
        </CardContent>
      </Card>
    </div>
  );
}
