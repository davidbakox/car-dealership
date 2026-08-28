import "server-only";
import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY service-role client. Bypasses RLS entirely.
// The `server-only` import makes the build fail if this file is ever imported
// into a client bundle, so the service-role key can never leak to the browser.
//
// Used for:
//   - the rate-limit table (login_attempts), which has NO anon/authenticated
//     policies and is therefore reachable only via the service role;
//   - the public form submissions in app/_actions/public.ts. The INSERT policy
//     on `offers` accepts an anonymous row only when it references no car, so
//     a question asked from a car's page was rejected by RLS and lost. The
//     actions validate a fixed shape with zod before writing, and this file is
//     server-only, so the elevated key never reaches the browser;
//   - the seed script.
// Do NOT reach for this to READ request data — the session client keeps RLS in
// force and is the right default everywhere else.
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
