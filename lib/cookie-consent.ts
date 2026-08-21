export const COOKIE_CONSENT_STORAGE_KEY =
  "dennis-cars-cookie-consent-v1";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_CHANGED_EVENT =
  "dennis-cars-cookie-consent-changed";
export const COOKIE_SETTINGS_OPEN_EVENT = "dennis-cars-cookie-settings-open";

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
      typeof parsed.externalMedia !== "boolean"
    ) {
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

  window.localStorage.setItem(
    COOKIE_CONSENT_STORAGE_KEY,
    JSON.stringify(consent)
  );
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: consent })
  );
  return consent;
}
