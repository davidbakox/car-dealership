import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
  ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL)
  : null;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudflare does NOT run Vercel's default image optimizer.
    // We route next/image through a custom Cloudflare Image Resizing loader
    // (see lib/cloudflare-image-loader.ts). If resizing is not enabled on the
    // zone yet, the loader falls back to the raw Supabase URL so nothing breaks.
    loader: "custom",
    loaderFile: "./lib/cloudflare-image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      ...(r2PublicUrl
        ? [
            {
              protocol: r2PublicUrl.protocol.replace(":", ""),
              hostname: r2PublicUrl.hostname,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default withNextIntl(nextConfig);
