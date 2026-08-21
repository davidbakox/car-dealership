"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MAPS_EMBED_SRC } from "@/lib/contact";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_SETTINGS_OPEN_EVENT,
  readCookieConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

export default function MapEmbed({
  title,
  compact = false,
}: {
  title: string;
  compact?: boolean;
}) {
  const t = useTranslations("cookieConsent");
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAllowed(readCookieConsent()?.externalMedia ?? false);
    setReady(true);

    const onConsentChanged = (event: Event) => {
      const consent = (event as CustomEvent<CookieConsent>).detail;
      setAllowed(Boolean(consent?.externalMedia));
    };

    window.addEventListener(
      COOKIE_CONSENT_CHANGED_EVENT,
      onConsentChanged as EventListener
    );
    return () =>
      window.removeEventListener(
        COOKIE_CONSENT_CHANGED_EVENT,
        onConsentChanged as EventListener
      );
  }, []);

  const heightClass = compact ? "h-40" : "h-full min-h-[420px]";

  if (!ready || !allowed) {
    return (
      <div
        className={`${heightClass} w-full overflow-hidden rounded-card border border-line bg-surface`}
      >
        <div className="flex h-full w-full flex-col items-center justify-center bg-surface-2 px-5 text-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="text-ink-faint"
            aria-hidden="true"
          >
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <p className="mt-2 text-sm font-medium text-ink">{t("mapBlocked")}</p>
          {!compact && (
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
              {t("mapBlockedText")}
            </p>
          )}
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new Event(COOKIE_SETTINGS_OPEN_EVENT))
            }
            className="mt-3 text-xs font-medium text-accent-hover underline underline-offset-2"
          >
            {t("openSettings")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${heightClass} w-full overflow-hidden rounded-card border border-line bg-surface`}
    >
      <iframe
        title={title}
        src={MAPS_EMBED_SRC}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full opacity-90 transition-opacity duration-300 hover:opacity-100"
        style={{ border: 0 }}
      />
    </div>
  );
}
