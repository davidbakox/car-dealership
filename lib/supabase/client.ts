"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client (anon key). Subject to RLS.
// Used by client components that read public data or run interactive flows.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
