"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { submitInquiryAction } from "@/app/_actions/public";
import type { PublicFormState } from "@/lib/form-state";
import FormPrivacyNotice from "./FormPrivacyNotice";

function SubmitBtn() {
  const { pending } = useFormStatus();
  const t = useTranslations("carDetail");
  const tf = useTranslations("form");
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? tf("submitting") : t("sendInquiry")}
    </button>
  );
}

export default function InquiryForm({ carId }: { carId: string }) {
  const t = useTranslations("form");
  const [state, action] = useFormState<PublicFormState, FormData>(
    submitInquiryAction,
    {}
  );
  const fe = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <p className="rounded border border-ok/40 bg-ok/10 px-4 py-3 text-sm text-ok">
        {t("successInquiry")}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3" noValidate>
      <input type="hidden" name="car_id" value={carId} />
      {state.error && (
        <p className="rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-400">
          {t(state.error === "rateLimited" ? "errorRateLimited" : "error")}
        </p>
      )}
      <div>
        <input name="buyer_name" placeholder={t("name")} className="field" required />
        {fe.buyer_name && <p className="mt-1 text-xs text-red-500">{fe.buyer_name}</p>}
      </div>
      <div>
        <input name="buyer_phone" placeholder={t("phone")} className="field" required />
        {fe.buyer_phone && <p className="mt-1 text-xs text-red-500">{fe.buyer_phone}</p>}
      </div>
      <div>
        <input name="buyer_email" type="email" placeholder={t("email")} className="field" required />
        {fe.buyer_email && <p className="mt-1 text-xs text-red-500">{fe.buyer_email}</p>}
      </div>
      <div>
        <textarea name="message" rows={3} placeholder={t("messagePlaceholder")} className="field" />
      </div>
      <FormPrivacyNotice />
      <SubmitBtn />
    </form>
  );
}
