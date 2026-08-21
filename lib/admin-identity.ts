import "server-only";

/** Normalize Auth e-mail addresses before comparing them. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Returns the sole administrator e-mail, or null when production is
 * misconfigured. Missing configuration deliberately fails closed.
 */
export function getAdminEmail(): string | null {
  const configured = process.env.ADMIN_EMAIL;
  if (!configured) return null;

  const normalized = normalizeEmail(configured);
  return normalized || null;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = getAdminEmail();
  return Boolean(adminEmail && email && normalizeEmail(email) === adminEmail);
}
