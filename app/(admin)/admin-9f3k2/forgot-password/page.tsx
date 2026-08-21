"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ADMIN_PATH } from "@/lib/env";
import { requestPasswordReset } from "./actions";
import type { PasswordResetRequestState } from "@/lib/form-state";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] =
    useState<PasswordResetRequestState["error"]>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);

    try {
      const result = await requestPasswordReset(email);
      if (result.ok) {
        setSent(true);
      } else {
        setError(result.error ?? "failed");
      }
    } catch {
      setError("failed");
    } finally {
      setPending(false);
    }
  }

  const errorMessage =
    error === "not_admin"
      ? "Ezzel az e-mail-címmel nem kérhető jelszó-visszaállítás."
      : error === "invalid_email"
        ? "Adj meg egy érvényes e-mail-címet."
        : "A link küldése nem sikerült. Próbáld újra néhány perc múlva.";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl font-semibold">
          Jelszó visszaállítása
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Add meg az adminisztrátori e-mail-címedet.
        </p>

        {sent ? (
          <div
            role="status"
            className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            Elküldtük a visszaállítási linket. Ellenőrizd a beérkező leveleket
            és a spam mappát is.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {errorMessage}
              </p>
            )}

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                E-mail-cím
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-light disabled:opacity-60"
            >
              {pending ? "Küldés…" : "Visszaállítási link küldése"}
            </button>
          </form>
        )}

        <Link
          href={`${ADMIN_PATH}/login`}
          className="mt-5 block text-center text-sm font-medium text-brand hover:underline"
        >
          Vissza a bejelentkezéshez
        </Link>
      </div>
    </main>
  );
}
