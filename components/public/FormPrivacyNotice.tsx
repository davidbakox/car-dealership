"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function FormPrivacyNotice() {
  const t = useTranslations("privacyNotice");

  return (
    <p className="text-xs leading-relaxed text-ink-faint">
      {t("prefix")}{" "}
      <Link
        href="/privacy"
        className="text-ink-muted underline underline-offset-2 hover:text-accent-hover"
      >
        {t("link")}
      </Link>
      .
    </p>
  );
}
