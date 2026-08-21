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
  // Persist the visitor's choice; next-intl reads/writes this cookie.
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
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

// Locale-aware navigation helpers — use these instead of next/link & next/navigation
// so links automatically carry the active locale and localized pathname.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
