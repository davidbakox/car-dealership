"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { SORTS } from "@/lib/car-filters";

// Sort dropdown for the listings toolbar. Rewrites only the `sort` param and
// drops `page`, so changing the order always lands the visitor back on page 1
// with every active filter intact.
export default function CarSort({ current }: { current: string }) {
  const t = useTranslations("cars");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const labels: Record<string, string> = {
    newest: t("sortNewest"),
    price_asc: t("sortPriceAsc"),
    price_desc: t("sortPriceDesc"),
    year_desc: t("sortYearDesc"),
    mileage_asc: t("sortMileageAsc"),
  };

  return (
    <label className="flex items-center gap-2 text-sm text-ink-muted">
      <span className="whitespace-nowrap">{t("sortLabel")}:</span>
      <select
        value={current}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sort", e.target.value);
          params.delete("page");
          router.push(`${pathname}?${params.toString()}`);
        }}
        className="select-field h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {labels[s]}
          </option>
        ))}
      </select>
    </label>
  );
}
