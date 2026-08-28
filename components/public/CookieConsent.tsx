"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  COOKIE_SETTINGS_OPEN_EVENT,
  readCookieConsent,
  saveCookieConsent,
} from "@/lib/cookie-consent";

// Accept and Reject are deliberately the SAME size, weight and shape, side by
// side on the first layer. Under Legea 506/2004 art. 4^1 and GDPR art. 7,
// refusing must be as easy as accepting, so the reject button gets no visual
// demotion — only the fill colour differs.
const consentButton =
  "inline-flex flex-1 items-center justify-center rounded border px-5 py-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:flex-none sm:min-w-[9.5rem]";
const consentButtonNeutral = `${consentButton} border-line-strong bg-surface-2 text-ink hover:bg-line`;
const consentButtonAccent = `${consentButton} border-accent bg-accent text-white hover:bg-accent-hover`;

export default function CookieConsent() {
  const t = useTranslations("cookieConsent");
  const [ready, setReady] = useState(false);
  const [hasChoice, setHasChoice] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [externalMedia, setExternalMedia] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const stored = readCookieConsent();
    setHasChoice(Boolean(stored));
    setExternalMedia(stored?.externalMedia ?? false);
    setReady(true);

    const openSettings = () => {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      const latest = readCookieConsent();
      setExternalMedia(latest?.externalMedia ?? false);
      setSettingsOpen(true);
    };

    window.addEventListener(COOKIE_SETTINGS_OPEN_EVENT, openSettings);
    return () =>
      window.removeEventListener(COOKIE_SETTINGS_OPEN_EVENT, openSettings);
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    restoreFocusRef.current?.focus();
    restoreFocusRef.current = null;
  }, []);

  function commit(allowExternalMedia: boolean) {
    saveCookieConsent(allowExternalMedia);
    setExternalMedia(allowExternalMedia);
    setHasChoice(true);
    setSettingsOpen(false);
    restoreFocusRef.current?.focus();
    restoreFocusRef.current = null;
  }

  // Modal behaviour for the settings dialog: Escape closes it (only once a
  // choice exists — never as a way to dismiss the first-visit prompt without
  // deciding), and Tab is trapped inside it.
  useEffect(() => {
    if (!settingsOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && hasChoice) {
        event.preventDefault();
        closeSettings();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (
        event.shiftKey &&
        (active === first || !dialogRef.current?.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    const id = window.setTimeout(() => dialogRef.current?.focus(), 40);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(id);
    };
  }, [settingsOpen, hasChoice, closeSettings]);

  if (!ready) return null;

  return (
    <>
      {!hasChoice && !settingsOpen && (
        <section
          className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-4xl rounded-card border border-line-strong bg-surface p-5 shadow-2xl shadow-black/50 sm:inset-x-6 sm:p-6"
          role="region"
          aria-label={t("bannerTitle")}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-lg font-semibold text-ink">
                {t("bannerTitle")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {t("bannerText")}{" "}
                <Link
                  href="/cookies"
                  className="text-accent-hover underline underline-offset-2"
                >
                  {t("cookiePolicy")}
                </Link>
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => commit(false)}
                className={consentButtonNeutral}
              >
                {t("reject")}
              </button>
              <button
                type="button"
                onClick={() => {
                  restoreFocusRef.current = null;
                  setSettingsOpen(true);
                }}
                className={consentButtonNeutral}
              >
                {t("settings")}
              </button>
              <button
                type="button"
                onClick={() => commit(true)}
                className={consentButtonAccent}
              >
                {t("accept")}
              </button>
            </div>
          </div>
        </section>
      )}

      {settingsOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-3 sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && hasChoice) {
              closeSettings();
            }
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            tabIndex={-1}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-card border border-line-strong bg-surface p-5 shadow-2xl outline-none sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="cookie-settings-title"
                  className="font-display text-2xl font-semibold text-ink"
                >
                  {t("settingsTitle")}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {t("settingsText")}
                </p>
              </div>
              {hasChoice && (
                <button
                  type="button"
                  onClick={closeSettings}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-line text-xl text-ink-muted hover:text-ink"
                  aria-label={t("close")}
                >
                  ×
                </button>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-card border border-line bg-base p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-ink">
                      {t("necessaryTitle")}
                    </h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {t("necessaryText")}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-hover">
                    {t("alwaysActive")}
                  </span>
                </div>
              </div>

              <label className="block cursor-pointer rounded-card border border-line bg-base p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-ink">
                      {t("externalTitle")}
                    </h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {t("externalText")}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={externalMedia}
                    onChange={(event) =>
                      setExternalMedia(event.currentTarget.checked)
                    }
                    className="h-5 w-5 shrink-0 accent-accent"
                  />
                </div>
              </label>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-ink-faint">
              {t("retention")} {t("noAnalytics")}{" "}
              <Link
                href="/privacy"
                className="text-ink-muted underline underline-offset-2"
              >
                {t("privacyPolicy")}
              </Link>
            </p>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => commit(false)}
                className={consentButtonNeutral}
              >
                {t("reject")}
              </button>
              <button
                type="button"
                onClick={() => commit(externalMedia)}
                className={consentButtonAccent}
              >
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
