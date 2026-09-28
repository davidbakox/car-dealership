import { createClient } from "@supabase/supabase-js";

// Cookie-less anon client for PUBLIC read-only pages (catalog, detail, sell).
// Public pages don't need a user session — they read under the anon role with
// RLS. Skipping the cookie-based SSR client removes per-request cookie work and
// keeps these pages lean on the edge. Writes/admin still use the session client.
//
// Every read goes straight to Supabase (`next: { revalidate: 0 }`). These reads
// used to go through Next's fetch cache (`revalidate: 60` + tags), but on
// Cloudflare Pages that cache hands one request's in-flight response stream to
// a concurrent request in the same isolate. Workers forbid that, so the second
// request never resolved: it hung until Cloudflare killed it (error 1102/524),
// and the poisoned isolate then broke unrelated requests with "Cannot perform
// I/O on behalf of a different request" / "ReadableStream is currently locked".
// Seen in production on 2026-09-28 — roughly every other car-page load hung.
// The catalogue is tens of rows, so one uncached round-trip costs nothing.
//
// Do NOT write `cache: "no-store"` here instead: Next forwards that field to
// the runtime fetch, and workerd at this compatibility_date rejects it, so
// every read failed, supabase-js retried for ~7s and the pages rendered an
// empty catalogue (production, 2026-09-28). `revalidate: 0` opts out of Next's
// cache without passing anything new to the runtime.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, next: { revalidate: 0 } } as RequestInit),
      },
    }
  );
}
