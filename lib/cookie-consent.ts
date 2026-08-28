export const COOKIE_CONSENT_STORAGE_KEY =
  "dennis-cars-cookie-consent-v1";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_CHANGED_EVENT =
  "dennis-cars-cookie-consent-changed";
export const COOKIE_SETTINGS_OPEN_EVENT = "dennis-cars-cookie-settings-open";

// Consent is not perpetual. EDPB guidance and ANSPDCP practice expect it to be
// refreshed periodically; six months is the interval published in the cookie
// policy. Past it, the stored record is treated as absent, the banner returns
// and optional technologies stay off until the visitor chooses again.
export const COOKIE_CONSENT_MAX_AGE_DAYS = 182;
const MAX_AGE_MS = COOKIE_CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export type CookieConsent = {
  version: number;
  necessary: true;
  externalMedia: boolean;
  updatedAt: string;
};

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (
      parsed.version !== COOKIE_CONSENT_VERSION ||
      parsed.necessary !== true ||
      typeof parsed.externalMedia !== "boolean" ||
      typeof parsed.updatedAt !== "string"
    ) {
      return null;
    }

    const recordedAt = Date.parse(parsed.updatedAt);
    if (Number.isNaN(recordedAt) || Date.now() - recordedAt > MAX_AGE_MS) {
      // Expired (or unreadable date): drop it so nothing optional can run on
      // the strength of a stale choice.
      window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
      return null;
    }

    return parsed as CookieConsent;
  } catch {
    return null;
  }
}

export function saveCookieConsent(externalMedia: boolean): CookieConsent {
  const consent: CookieConsent = {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    externalMedia,
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(consent)
    );
  } catch {
    // Private mode / storage disabled: the choice still applies to this page
    // view via the event below, it simply cannot be remembered.
  }
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: consent })
  );
  return consent;
}
