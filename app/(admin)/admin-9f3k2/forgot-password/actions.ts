"use server";

import { z } from "zod";
import { getAdminEmail, normalizeEmail } from "@/lib/admin-identity";
import { ADMIN_PATH } from "@/lib/env";
import type { PasswordResetRequestState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email();

export async function requestPasswordReset(
  email: string
): Promise<PasswordResetRequestState> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { error: "invalid_email" };

  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    console.error("Password reset is disabled: ADMIN_EMAIL is not configured");
    return { error: "misconfigured" };
  }

  const normalizedEmail = normalizeEmail(parsed.data);
  if (normalizedEmail !== adminEmail) return { error: "not_admin" };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!supabaseUrl || !anonKey || !siteUrl) {
    console.error("Password reset is disabled: required environment is missing");
    return { error: "misconfigured" };
  }

  let redirectTo: string;
  try {
    redirectTo = new URL(`${ADMIN_PATH}/reset-password`, siteUrl).toString();
  } catch {
    console.error("Password reset is disabled: NEXT_PUBLIC_SITE_URL is invalid");
    return { error: "misconfigured" };
  }

  // The SSR client uses PKCE and stores the verifier in an HttpOnly-compatible
  // response cookie, allowing the live reset page to exchange Supabase's code.
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo,
  });

  if (error) {
    console.error("Supabase password reset failed:", error.message);
    return { error: "failed" };
  }

  return { ok: true };
}
