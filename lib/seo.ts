import type { Metadata } from "next";
import { getPathname, routing, type Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/env";
import {
  EMAIL,
  LEGAL_NAME,
  PHONE,
  SECONDARY_PHONE,
  TRADE_NAME,
} from "@/lib/contact";

type Href = Parameters<typeof getPathname>[0]["href"];

export function absoluteUrl(locale: string, href: Href): string {
  return `${SITE_URL}${getPathname({ href, locale: locale as Locale })}`;
}

// Canonical + hreflang for one page. Every public page sets this itself — it
// must never live in the layout, where every child would inherit the home
// page's canonical. The RO version is the x-default: the site is Romanian first.
export function localeAlternates(
  locale: string,
  href: Href
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = absoluteUrl(l, href);
  languages["x-default"] = absoluteUrl(routing.defaultLocale, href);
  return { canonical: absoluteUrl(locale, href), languages };
}

/** Serialise structured data so it cannot break out of the <script> block. */
export function toJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

// The dealership as a local business — what lets Google tie the site to the
// Carei showroom (Maps, "car dealer near me", the knowledge panel).
export function dealerJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${SITE_URL}/#dealer`,
    name: TRADE_NAME,
    legalName: LEGAL_NAME,
    url: absoluteUrl(locale, "/"),
    telephone: [PHONE, SECONDARY_PHONE].map((p) => p.replace(/\s/g, "")),
    email: EMAIL,
    image: `${SITE_URL}/icon.svg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Str. Mihai Viteazu nr. 57",
      addressLocality: "Carei",
      addressRegion: "Satu Mare",
      addressCountry: "RO",
    },
    areaServed: ["Carei", "Satu Mare", "Romania"],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "10:00",
        closes: "14:00",
      },
    ],
  };
}
