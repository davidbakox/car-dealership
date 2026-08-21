// Custom next/image loader for Cloudflare Pages.
//
// WHY: Next.js's default image loader calls Vercel's image-optimization
// service, which does NOT exist on the Cloudflare runtime. Cloudflare provides
// its own "Image Resizing" via the /cdn-cgi/image/ path prefix instead.
//
// This loader emits a /cdn-cgi/image/ URL when NEXT_PUBLIC_CF_IMAGE_RESIZING is
// enabled; otherwise it returns the raw source URL unchanged, so the site works
// (unoptimized) before you turn Image Resizing on for the zone.

interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

const RESIZING_ENABLED =
  process.env.NEXT_PUBLIC_CF_IMAGE_RESIZING === "true";

export default function cloudflareImageLoader({
  src,
  width,
  quality,
}: LoaderArgs): string {
  if (!RESIZING_ENABLED) {
    // Fallback: serve the original (e.g. Supabase public URL) unresized.
    // Next.js requires the loader's output to vary by width (it uses this to
    // build the responsive srcset); a harmless "w" query param satisfies that
    // without actually resizing anything server-side. Supabase Storage ignores
    // unknown query params, so the same full image is returned either way.
    const separator = src.includes("?") ? "&" : "?";
    return `${src}${separator}w=${width}`;
  }

  const params = [`width=${width}`, `quality=${quality ?? 75}`, "format=auto"];
  // Cloudflare resizes any absolute URL passed after the options segment.
  return `/cdn-cgi/image/${params.join(",")}/${src}`;
}
