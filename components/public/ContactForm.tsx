"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { submitContactAction } from "@/app/_actions/public";
import type { PublicFormState } from "@/lib/form-state";
import FormPrivacyNotice from "./FormPrivacyNotice";

function SubmitBtn() {
  const { pending } = useFormStatus();
  const t = useTranslations("form");
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? t("submitting") : t("submit")}
    </button>
  );
}

export default function ContactForm() {
  const t = useTranslations("form");
  const tc = useTranslations("contact");
  const [state, action] = useFormState<PublicFormState, FormData>(
    submitContactAction,
    {}
  );
  const fe = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <p className="rounded border border-ok/40 bg-ok/10 px-4 py-3 text-sm text-ok">
        {t("successContact")}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3" noValidate>
      {state.error && (
        <p className="rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-400">
          {t("error")}
        </p>
      )}
      <div>
        <input name="name" placeholder={t("name")} className="field" required />
        {fe.name && <p className="mt-1 text-xs text-red-500">{fe.name}</p>}
      </div>
      <div>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder={tc("phonePlaceholder")}
          className="field"
          required
        />
        {fe.phone && <p className="mt-1 text-xs text-red-500">{fe.phone}</p>}
      </div>
      <div>
        <textarea
          name="message"
          rows={5}
          placeholder={tc("messageLabel")}
          className="field"
          required
        />
        {fe.message && <p className="mt-1 text-xs text-red-500">{fe.message}</p>}
      </div>
      <FormPrivacyNotice />
      <SubmitBtn />
    </form>
  );
}
