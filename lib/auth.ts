import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ADMIN_PATH } from "@/lib/env";
import { isAdminEmail } from "@/lib/admin-identity";

/**
 * Server-side guard used by admin Server Components and Server Actions.
 * Revalidates the session against Supabase (getUser, not getSession) and
 * redirects to login if absent. Middleware already blocks navigation, but
 * calling this in data-loading code ensures admin data is NEVER fetched
 * before the session is verified — belt and suspenders.
 */
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect(`${ADMIN_PATH}/login`);
  }
  return { supabase, user };
}
