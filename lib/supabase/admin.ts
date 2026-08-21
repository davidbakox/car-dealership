import "server-only";
import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY service-role client. Bypasses RLS entirely.
// The `server-only` import makes the build fail if this file is ever imported
// into a client bundle, so the service-role key can never leak to the browser.
//
// Used for:
//   - the rate-limit table (login_attempts), which has NO anon/authenticated
//     policies and is therefore reachable only via the service role;
//   - the seed script.
// Do NOT use this for ordinary request handling — prefer the session client
// so RLS stays in force.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
