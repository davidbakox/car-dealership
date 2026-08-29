import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
  ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL)
  : null;

// Sent on every response. The CSP deliberately stops short of `script-src`:
// locking scripts down properly needs a per-request nonce threaded through the
// middleware, and a half-written `script-src` that has to carry
// 'unsafe-inline' buys nothing while risking a blank page. What is here costs
// nothing and closes the cheap attacks — framing, base-tag injection, form
// hijacking, MIME sniffing and referrer leakage.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
  // Same intent as frame-ancestors, for browsers that predate it.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
