// One-time helper: creates the first admin login.
// Usage: node scripts/seed-admin.mjs "Admin Name" admin@example.com "StrongPass123"
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^=#]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const [, , fullName, email, password] = process.argv;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (check .env.local)");
  process.exit(1);
}
if (!fullName || !email || !password) {
  console.error('Usage: node scripts/seed-admin.mjs "Admin Name" admin@example.com "StrongPass123"');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (createError || !created.user) {
  console.error("Failed to create auth user:", createError?.message);
  process.exit(1);
}

const { error: profileError } = await supabase.from("profiles").insert({
  id: created.user.id,
  role: "admin",
  full_name: fullName,
});

if (profileError) {
  console.error("Failed to create profile:", profileError.message);
  process.exit(1);
}

console.log(`Admin created: ${email}`);
