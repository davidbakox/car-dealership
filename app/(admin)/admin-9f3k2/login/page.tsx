"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import type { LoginState } from "@/lib/form-state";
import { t } from "@/lib/i18n/config";
import { ADMIN_PATH } from "@/lib/env";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-white transition hover:bg-brand-light disabled:opacity-60"
    >
      {pending ? t.admin_signing_in : t.admin_signin}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [state, formAction] = useFormState<LoginState, FormData>(
    loginAction,
    {}
  );

  // On success the action has set the session cookie.
  // Navigate to the intended page (or dashboard) and refresh RSC data.
  useEffect(() => {
    if (state.success) {
      const next = params.get("next") || ADMIN_PATH;
      // Basic open-redirect guard: only allow same-site admin paths.
      const dest = next.startsWith(ADMIN_PATH) ? next : ADMIN_PATH;
      router.replace(dest);
      router.refresh();
    }
  }, [params, router, state.success]);

  const errorMsg =
    state.error === "rate_limited"
      ? t.admin_rate_limited
      : state.error === "invalid"
        ? t.admin_login_failed
        : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold">
          {t.admin_login_title}
        </h1>

        {errorMsg && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {errorMsg}
          </p>
        )}

        <form action={formAction} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              {t.admin_email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
            {state.fieldErrors?.email && (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              {t.admin_password}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
            {state.fieldErrors?.password && (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.password}
              </p>
            )}
          </div>

          <SubmitButton />
        </form>

        <Link
          href={`${ADMIN_PATH}/forgot-password`}
          className="mt-5 block text-center text-sm font-medium text-brand hover:underline"
        >
          Elfelejtetted a jelszavad?
        </Link>
      </div>
    </main>
  );
}
