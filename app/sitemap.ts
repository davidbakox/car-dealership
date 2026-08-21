import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE_URL } from "@/lib/env";
import { routing, getPathname } from "@/i18n/routing";

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

  for (const locale of routing.locales) {
    const abs = (path: string) => `${SITE_URL}${path}`;

    entries.push(
      { url: abs(getPathname({ href: "/", locale })), changeFrequency: "daily", priority: 1 },
      { url: abs(getPathname({ href: "/cars", locale })), changeFrequency: "daily", priority: 0.9 },
      { url: abs(getPathname({ href: "/sell", locale })), changeFrequency: "monthly", priority: 0.8 },
      { url: abs(getPathname({ href: "/about", locale })), changeFrequency: "monthly", priority: 0.5 },
      { url: abs(getPathname({ href: "/contact", locale })), changeFrequency: "monthly", priority: 0.5 },
      { url: abs(getPathname({ href: "/legal", locale })), changeFrequency: "yearly", priority: 0.3 },
      { url: abs(getPathname({ href: "/privacy", locale })), changeFrequency: "yearly", priority: 0.3 },
      { url: abs(getPathname({ href: "/cookies", locale })), changeFrequency: "yearly", priority: 0.3 }
    );

    for (const car of cars) {
      entries.push({
        url: abs(
          getPathname({ href: { pathname: "/cars/[id]", params: { id: car.id } }, locale })
        ),
        lastModified: car.created_at,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
