import { headers } from "next/headers";

/**
 * Best-effort client IP for rate limiting. On Cloudflare Pages the reliable
 * header is CF-Connecting-IP; we fall back to X-Forwarded-For for local dev.
 */
export function getClientIp(): string {
  const h = headers();
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
