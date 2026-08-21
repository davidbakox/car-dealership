"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_PATH } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

type Phase = "checking" | "ready" | "saving" | "success" | "invalid";

export default function ResetPasswordPage() {
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function prepareRecoverySession() {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const isImplicitRecovery =
        hashParams.get("type") === "recovery" &&
        Boolean(accessToken) &&
        Boolean(refreshToken);
      const hasCallbackError =
        hashParams.has("error") ||
        hashParams.has("error_code") ||
        hashParams.has("error_description");

      // @supabase/ssr uses PKCE. Remove legacy implicit tokens before creating
      // that client, then establish the session explicitly with setSession().
      if (window.location.hash) {
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${window.location.search}`
        );
      }

      if (hasCallbackError) {
        if (active) setPhase("invalid");
        return;
      }

      const supabase = createClient();
      supabaseRef.current = supabase;

      if (isImplicitRecovery && accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (active) setPhase(sessionError ? "invalid" : "ready");
        return;
      }

      // PKCE recovery links are exchanged automatically during client
      // initialization. getSession() waits for that initialization to finish.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (active) setPhase(sessionError || !session ? "invalid" : "ready");
    }

    void prepareRecoverySession();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 10) {
      setError("A jelszó legalább 10 karakter hosszú legyen.");
      return;
    }
    if (password !== confirmation) {
      setError("A két jelszó nem egyezik.");
      return;
    }

    const supabase = supabaseRef.current;
    if (!supabase) {
      setPhase("invalid");
      return;
    }

    setPhase("saving");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError("A jelszó mentése nem sikerült. Kérj új visszaállítási linket.");
      setPhase("ready");
      return;
    }

    // Revoke recovery and other refresh sessions after the password change.
    await supabase.auth.signOut();
    setPassword("");
    setConfirmation("");
    setPhase("success");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl font-semibold">Új jelszó beállítása</h1>

        {phase === "checking" && (
          <p role="status" className="mt-5 text-center text-sm text-slate-600">
            A visszaállítási link ellenőrzése…
          </p>
        )}

        {phase === "invalid" && (
          <>
            <p
              role="alert"
              className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              Ez a visszaállítási link érvénytelen vagy lejárt. Kérj egy új
              linket.
            </p>
            <Link
              href={`${ADMIN_PATH}/forgot-password`}
              className="mt-5 block text-center text-sm font-medium text-brand hover:underline"
            >
              Új link kérése
            </Link>
          </>
        )}

        {(phase === "ready" || phase === "saving") && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium"
              >
                Új jelszó
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={10}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>

            <div>
              <label
                htmlFor="confirmation"
                className="mb-1 block text-sm font-medium"
              >
                Új jelszó újra
              </label>
              <input
                id="confirmation"
                type="password"
                autoComplete="new-password"
                minLength={10}
                required
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              disabled={phase === "saving"}
              className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-light disabled:opacity-60"
            >
              {phase === "saving" ? "Mentés…" : "Jelszó mentése"}
            </button>
          </form>
        )}

        {phase === "success" && (
          <>
            <p
              role="status"
              className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              A jelszavad megváltozott. Most már bejelentkezhetsz az új
              jelszóval.
            </p>
            <Link
              href={`${ADMIN_PATH}/login`}
              className="mt-5 block rounded-lg bg-brand px-4 py-2.5 text-center font-medium text-white transition hover:bg-brand-light"
            >
              Bejelentkezés
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
