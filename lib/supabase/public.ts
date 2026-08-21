import { createClient } from "@supabase/supabase-js";
import { CARS_CACHE_TAG } from "@/lib/cache-tags";

const PUBLIC_DATA_REVALIDATE_SECONDS = 60;

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

// Cookie-less anon client for PUBLIC read-only pages (catalog, detail, sell).
// Public pages don't need a user session — they read under the anon role with
// RLS. Skipping the cookie-based SSR client removes per-request cookie work and
// keeps these pages lean on the edge. Writes/admin still use the session client.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      // Catalogue reads are shared for a short window instead of making every
      // navigation wait on a new Supabase round-trip. Admin car mutations
      // invalidate this tag immediately, so edits still appear right away.
      global: {
        fetch: (input, init) => {
          const nextInit = init as NextFetchInit | undefined;
          return fetch(input, {
            ...init,
            next: {
              ...nextInit?.next,
              revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
              tags: [
                ...new Set([
                  ...(nextInit?.next?.tags ?? []),
                  CARS_CACHE_TAG,
                ]),
              ],
            },
          });
        },
      },
    }
  );
}
