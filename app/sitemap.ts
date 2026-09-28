import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { routing } from "@/i18n/routing";
import { absoluteUrl, localeAlternates } from "@/lib/seo";

export const runtime = "edge";

// Emits both locales for the static pages and every available car, using the
// localized pathnames (e.g. /masini vs /hu/autok).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("cars")
    .select("id, created_at")
    .eq("status", "available");
  const cars = (data ?? []) as { id: string; created_at: string }[];

  const entries: MetadataRoute.Sitemap = [];

  type Href = Parameters<typeof absoluteUrl>[1];
  // Each URL lists its other-language twin (hreflang), so Google pairs the
  // RO and HU versions instead of treating them as duplicates.
  const entry = (
    locale: string,
    href: Href,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: number,
    lastModified?: string
  ): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(locale, href),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages: localeAlternates(locale, href).languages as Record<string, string> },
  });

  for (const locale of routing.locales) {
    entries.push(
      entry(locale, "/", "daily", 1),
      entry(locale, "/cars", "daily", 0.9),
      entry(locale, "/sell", "monthly", 0.8),
      entry(locale, "/about", "monthly", 0.5),
      entry(locale, "/contact", "monthly", 0.5),
      entry(locale, "/legal", "yearly", 0.3),
      entry(locale, "/privacy", "yearly", 0.3),
      entry(locale, "/cookies", "yearly", 0.3)
    );

    for (const car of cars) {
      entries.push(
        entry(
          locale,
          { pathname: "/cars/[id]", params: { id: car.id } },
          "weekly",
          0.7,
          car.created_at
        )
      );
    }
  }

  return entries;
}
