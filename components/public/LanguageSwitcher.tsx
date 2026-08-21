"use client";

import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter, routing, type Locale } from "@/i18n/routing";

// RO/HU toggle. Switching re-navigates to the SAME page in the target locale
// (next-intl rebuilds the localized pathname, incl. dynamic segments). The
// choice is persisted via the NEXT_LOCALE cookie (configured in routing.ts).
export default function LanguageSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const active = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    if (locale === active) return;
    startTransition(() => {
      // Pass current params so dynamic routes (/cars/[id]) re-localize correctly.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace({ pathname, params } as any, { locale });
    });
  }

  return (
    <div
      className={`inline-flex overflow-hidden rounded border border-line ${className}`}
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchTo(locale)}
          disabled={pending}
          aria-pressed={locale === active}
          className={`px-2.5 py-1.5 text-xs font-medium uppercase transition ${
            locale === active
              ? "bg-accent text-white"
              : "bg-transparent text-ink-muted hover:text-ink"
          }`}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
