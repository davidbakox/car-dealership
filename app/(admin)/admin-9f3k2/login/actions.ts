"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/schemas";
import { checkLoginRate, recordLoginAttempt } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import type { LoginState } from "@/lib/form-state";
import { isAdminEmail, normalizeEmail } from "@/lib/admin-identity";

// Server action for admin sign-in. Validates server-side, rate-limits by
// (ip + email), then delegates password verification to Supabase Auth
// (bcrypt, server-side). We never see or hash the raw password ourselves.
export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }
  const email = normalizeEmail(parsed.data.email);
  const { password } = parsed.data;
  const ip = getClientIp();

  // ---- rate limit ----
  const rate = await checkLoginRate(ip, email);
  if (!rate.allowed) {
    // Record it too: an attacker who keeps hammering during the lockout would
    // otherwise let the window slide past their last logged attempt and be
    // handed a fresh budget the moment it expires.
    await recordLoginAttempt(ip, email, false);
    return { error: "rate_limited" };
  }

  // This application has exactly one administrator. Reject every other
  // Supabase identity before attempting authentication.
  if (!isAdminEmail(email)) {
    await recordLoginAttempt(ip, email, false);
    return { error: "invalid" };
  }

  // ---- authenticate ----
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !isAdminEmail(data.user?.email)) {
    if (data.user) await supabase.auth.signOut();
    await recordLoginAttempt(ip, email, false);
    return { error: "invalid" };
  }

  await recordLoginAttempt(ip, email, true);
  return { success: true }; // The client redirects; the session cookie is set.
}

function flatten(err: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) out[i.path.join(".") || "_form"] = i.message;
  return out;
}
