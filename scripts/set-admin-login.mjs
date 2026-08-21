// One-time helper: sets the admin's User ID + password, and swaps their
// email for a neutral placeholder until they add their real Gmail via
// Settings. Usage: node scripts/set-admin-login.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^=#]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERNAME = "Blusip7467";
const PASSWORD = "74671146$%^&";
const PLACEHOLDER_EMAIL = "blusip7467@fieldtrack.internal";

const { data: users } = await supabase.auth.admin.listUsers();
const admin = users.users.find((u) => u.email === "hashtageyewear@gmail.com");
if (!admin) {
  console.error("Could not find the seeded admin account.");
  process.exit(1);
}

const { error: authError } = await supabase.auth.admin.updateUserById(admin.id, {
  email: PLACEHOLDER_EMAIL,
  password: PASSWORD,
  email_confirm: true,
});
if (authError) {
  console.error("Auth update failed:", authError.message);
  process.exit(1);
}

const { error: profileError } = await supabase.from("profiles").update({ username: USERNAME }).eq("id", admin.id);
if (profileError) {
  console.error("Profile update failed:", profileError.message);
  process.exit(1);
}

console.log(`Admin login set. User ID: ${USERNAME} / Password: ${PASSWORD}`);
console.log(`Placeholder email: ${PLACEHOLDER_EMAIL} (add a real Gmail via Settings once known)`);
