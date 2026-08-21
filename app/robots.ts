import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { ADMIN_PATH } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep the admin area out of the index (defense-in-depth for the
      // obscure path; access is enforced by auth regardless).
      disallow: [ADMIN_PATH, "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
