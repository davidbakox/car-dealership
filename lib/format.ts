// Small shared formatting helpers used across admin + public.

// Prices/numbers use Romanian conventions ("13.900 €", "92.000 km") — the
// audience is RO/HU, where dot-grouping is standard; en-GB commas read wrong.
export function formatPrice(
  amount: number | null | undefined,
  currency = "EUR"
): string {
  if (amount === null || amount === undefined) return "—";
  try {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("ro-RO").format(n);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
