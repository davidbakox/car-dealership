import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Login rate limiting backed by the `login_attempts` table.
//
// WHY a table and not an in-memory Map: on Cloudflare Workers each request may
// run in a fresh isolate, so module-scope state does not reliably persist.
// A shared store (the DB) is required. login_attempts has no RLS policies, so
// it is reachable only through the service-role client below.

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 8; // per (ip + email) within the window

export interface RateResult {
  allowed: boolean;
  remaining: number;
}

/** Count recent failed attempts for this ip/email and decide if allowed. */
export async function checkLoginRate(
  ip: string,
  email: string
): Promise<RateResult> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();

  const { count, error } = await admin
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .eq("email", email)
    .eq("succeeded", false)
    .gte("created_at", since);

  if (error) {
    // Fail OPEN on infra error so a DB hiccup can't lock out the sole admin,
    // but log for visibility.
    console.error("rate-limit check failed:", error.message);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  const used = count ?? 0;
  return { allowed: used < MAX_ATTEMPTS, remaining: Math.max(0, MAX_ATTEMPTS - used) };
}

/** Record an attempt (success clears the pressure on the next window). */
export async function recordLoginAttempt(
  ip: string,
  email: string,
  succeeded: boolean
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("login_attempts")
    .insert({ ip, email, succeeded });
  if (error) console.error("rate-limit record failed:", error.message);
}
