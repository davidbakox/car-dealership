import { en } from "./strings/en";
import { ro } from "./strings/ro";
import { hu } from "./strings/hu";

export const LOCALES = ["en", "ro", "hu"] as const;
export type Locale = (typeof LOCALES)[number];

// Default UI language. Switch this single value (or wire it to a cookie/route
// later) to change the whole site's language. Romanian/Hungarian are prepared
// as stubs that fall back to English for any missing key.
// Admin panel is Hungarian only (project decision). The public site does NOT
// use this dictionary — it uses next-intl (see /i18n + /messages).
export const DEFAULT_LOCALE: Locale = "hu";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Partial<Record<keyof Dictionary, string>>> = {
  en,
  ro,
  hu,
};

/**
 * Returns the dictionary for a locale, with English as the fallback for any
 * key not yet translated. This lets ro/hu ship partially filled.
 */
export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return { ...en, ...(dictionaries[locale] ?? {}) } as Dictionary;
}

// Convenience: the active dictionary for the default locale.
export const t = getDictionary(DEFAULT_LOCALE);
