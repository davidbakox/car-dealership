import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

// Locale routing for the public site.
//  - ro is the default and has NO url prefix  (/, /masini, /licitatii, …)
//  - hu is prefixed                            (/hu, /hu/autok, /hu/arveresek, …)
// Folder names under app/[locale] use the canonical English keys below;
// `pathnames` maps them to the localized URLs the user sees.
export const routing = defineRouting({
  locales: ["ro", "hu"],
  defaultLocale: "ro",
  localePrefix: "as-needed",
  // Never infer the language from the browser: Carei has a large Hungarian
  // speaking population, but the site is Romanian first and must open in RO for
  // everyone who has not chosen otherwise. Turning this off also stops next-intl
  // from managing NEXT_LOCALE, so LanguageSwitcher writes it on an explicit
  // switch and the middleware honours it on the entry URL only.
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/cars": { ro: "/masini", hu: "/autok" },
    "/cars/[id]": { ro: "/masini/[id]", hu: "/autok/[id]" },
    // Customer-car consignment page — replaced the public auctions.
    "/sell": { ro: "/vinde-masina", hu: "/add-el-az-autod" },
    "/about": { ro: "/despre", hu: "/rolunk" },
    "/contact": { ro: "/contact", hu: "/kapcsolat" },
    "/legal": { ro: "/informatii-legale", hu: "/jogi-informaciok" },
    "/privacy": {
      ro: "/politica-de-confidentialitate",
      hu: "/adatvedelmi-tajekoztato",
    },
    "/cookies": {
      ro: "/politica-de-cookies",
      hu: "/cookie-szabalyzat",
    },
  },
});

export type Locale = (typeof routing.locales)[number];

// Remembers an explicit language choice. Strictly necessary (it only stores the
// preference the visitor asked for), and documented as such in the cookie policy.
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Locale-aware navigation helpers — use these instead of next/link & next/navigation
// so links automatically carry the active locale and localized pathname.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
