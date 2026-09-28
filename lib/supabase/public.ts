import { createClient } from "@supabase/supabase-js";

// Cookie-less anon client for PUBLIC read-only pages (catalog, detail, sell).
// Public pages don't need a user session — they read under the anon role with
// RLS. Skipping the cookie-based SSR client removes per-request cookie work and
// keeps these pages lean on the edge. Writes/admin still use the session client.
//
// Every read goes straight to Supabase (`cache: "no-store"`). These reads used
// to go through Next's fetch cache (`next: { revalidate: 60, tags }`), but on
// Cloudflare Pages that cache hands one request's in-flight response stream to
// a concurrent request in the same isolate. Workers forbid that, so the second
// request never resolved: it hung until Cloudflare killed it (error 1102/524),
// and the poisoned isolate then broke unrelated requests with "Cannot perform
// I/O on behalf of a different request" / "ReadableStream is currently locked".
// Seen in production on 2026-09-28 — roughly every other car-page load hung.
// The catalogue is tens of rows, so one uncached round-trip costs nothing.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}
