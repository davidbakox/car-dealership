"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ADMIN_PATH } from "@/lib/env";

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect(`${ADMIN_PATH}/login`);
}
