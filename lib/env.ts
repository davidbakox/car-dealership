// Centralised env access. Keeps the obscure admin path + flags in one place.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// The obscure admin base path (must match the folder under app/).
// Kept in env so it can be rotated without moving files if you also rename
// the folder. Defaults to the checked-in folder name.
export const ADMIN_PATH =
  process.env.NEXT_PUBLIC_ADMIN_PATH ?? "/admin-9f3k2";

export const CF_IMAGE_RESIZING =
  process.env.NEXT_PUBLIC_CF_IMAGE_RESIZING === "true";

// Largest photo the admin uploader will pick up. Originals never leave the
// browser: they are shrunk to WebP/JPEG first, and lib/r2.ts caps what is
// actually stored (5 MB, JPEG/PNG/WebP/AVIF).
export const MAX_IMAGE_BYTES = 50 * 1024 * 1024; // 50 MB source file
