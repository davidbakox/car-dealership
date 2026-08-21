"use client";

import { useEffect } from "react";
import { ADMIN_PATH } from "@/lib/env";

/**
 * Supabase can fall back to the configured Site URL for recovery emails.
 * URL fragments never reach Next.js middleware, so move a recovery fragment
 * from the public homepage to the page that can consume it in the browser.
 */
export default function RecoveryRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));
    const search = window.location.search;
    const searchParams = new URLSearchParams(search);
    const isRecoveryHash =
      params.get("type") === "recovery" ||
      params.has("error_code") ||
      params.has("error_description");
    const isRecoveryQuery =
      searchParams.has("code") ||
      searchParams.has("error_code") ||
      searchParams.has("error_description");

    if (isRecoveryHash || isRecoveryQuery) {
      window.location.replace(
        `${ADMIN_PATH}/reset-password${search}${hash}`
      );
    }
  }, []);

  return null;
}
