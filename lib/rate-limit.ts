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

// ---------------------------------------------------------------------------
//  Public forms
// ---------------------------------------------------------------------------
// The three public forms write into `offers` through the service role, so
// nothing at the database level slows a script down any more. This puts a
// ceiling on how often one address may submit.
//
// It reuses login_attempts rather than adding a table, because DDL against this
// project has to be pasted into the Supabase SQL editor by hand and a limiter
// that ships with the code is worth more than a tidier schema. The marker in
// the `email` column keeps the two uses apart, the same way the markers in
// `offers` separate the kinds of submission.
const FORM_WINDOW_MINUTES = 15;
const FORM_MAX_SUBMISSIONS = 5; // per IP, across all public forms
const FORM_MARKER = "__public_form__";

/** True when this address may submit again. Fails OPEN, like the login check. */
export async function checkPublicFormRate(ip: string): Promise<boolean> {
  if (!ip || ip === "unknown") return true;

  const admin = createAdminClient();
  const since = new Date(Date.now() - FORM_WINDOW_MINUTES * 60_000).toISOString();

  const { count, error } = await admin
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .eq("email", FORM_MARKER)
    .gte("created_at", since);

  if (error) {
    // A database hiccup must never stop a real customer from reaching us.
    console.error("form rate-limit check failed:", error.message);
    return true;
  }

  return (count ?? 0) < FORM_MAX_SUBMISSIONS;
}

/** Record a submission against the window. Never throws into the action. */
export async function recordPublicFormSubmission(ip: string): Promise<void> {
  if (!ip || ip === "unknown") return;

  const admin = createAdminClient();
  const { error } = await admin
    .from("login_attempts")
    .insert({ ip, email: FORM_MARKER, succeeded: true });
  if (error) console.error("form rate-limit record failed:", error.message);
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
