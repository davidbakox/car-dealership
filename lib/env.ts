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

// Image upload limits — enforced in the upload action AND at the bucket level.
// Original files are compressed in the browser before being sent to R2.
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20 MB source file
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
