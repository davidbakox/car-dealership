"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { submitSellRequestAction } from "@/app/_actions/public";
import type { PublicFormState } from "@/lib/form-state";
import FormPrivacyNotice from "./FormPrivacyNotice";

function SubmitBtn() {
  const t = useTranslations("sell");
  const tf = useTranslations("form");
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? tf("submitting") : t("submit")}
    </button>
  );
}

export default function SellForm() {
  const t = useTranslations("sell");
  const tf = useTranslations("form");
  const [state, action] = useFormState<PublicFormState, FormData>(
    submitSellRequestAction,
    {}
  );
  const fe = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <p className="rounded border border-ok/40 bg-ok/10 px-4 py-3 text-sm text-ok">
        {t("success")}
      </p>
    );
  }

  const err = (key: string) =>
    fe[key] ? <p className="mt-1 text-xs text-red-500">{fe[key]}</p> : null;

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.error && (
        <p className="rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-400">
          {tf("error")}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <input name="car_make" placeholder={t("carMake")} className="field" required />
          {err("car_make")}
        </div>
        <div>
          <input name="car_model" placeholder={t("carModel")} className="field" required />
          {err("car_model")}
        </div>
        <div>
          <input
            name="car_year"
            type="number"
            inputMode="numeric"
            placeholder={t("carYear")}
            className="field"
            required
          />
          {err("car_year")}
        </div>
        <div>
          <input
            name="car_mileage"
            type="number"
            inputMode="numeric"
            placeholder={t("carMileage")}
            className="field"
            required
          />
          {err("car_mileage")}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <input name="seller_name" placeholder={tf("name")} className="field" required />
          {err("seller_name")}
        </div>
        <div>
          <input name="seller_phone" placeholder={tf("phone")} className="field" required />
          {err("seller_phone")}
        </div>
      </div>
      <div>
        <input
          name="seller_email"
          type="email"
          placeholder={tf("email")}
          className="field"
          required
        />
        {err("seller_email")}
      </div>
      <div>
        <textarea
          name="message"
          rows={4}
          placeholder={t("messagePh")}
          className="field"
        />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 rounded border border-line bg-surface-2 p-4">
          <input
            type="checkbox"
            name="terms_accepted"
            className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
            required
          />
          <span className="text-sm leading-relaxed text-ink-muted">
            {t("termsLabel")}
          </span>
        </label>
        {fe.terms_accepted && (
          <p className="mt-1 text-xs text-red-500">{t("termsError")}</p>
        )}
      </div>

      <FormPrivacyNotice />
      <SubmitBtn />
    </form>
  );
}
