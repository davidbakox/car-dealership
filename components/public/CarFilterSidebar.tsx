"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Icon from "@/components/ui/Icon";
import {
  FUEL_TYPES,
  TRANSMISSIONS,
  BODY_TYPES,
  DRIVETRAINS,
  EURO_NORMS,
  CAR_FEATURES,
} from "@/lib/types";
import {
  type CarFilters,
  YEARS,
  MILEAGE_LIMITS,
  SEAT_OPTIONS,
  one,
  many,
  activeFilterCount,
} from "@/lib/car-filters";
import { formatNumber } from "@/lib/format";

// Advanced filter rail for the listings page. A plain GET form, so results are
// server-rendered and every filter combination is a shareable URL. Collapses
// behind a toggle below `lg`, sticky alongside the grid above it.
export default function CarFilterSidebar({
  makes,
  modelsByMake,
  current,
  sort,
}: {
  makes: string[];
  modelsByMake: Record<string, string[]>;
  current: CarFilters;
  sort: string;
}) {
  const t = useTranslations("cars");
  const tf = useTranslations("fuel");
  const tr = useTranslations("transmission");
  const tb = useTranslations("bodyType");
  const td = useTranslations("drivetrain");
  const te = useTranslations("euro");
  const tft = useTranslations("features");

  const [open, setOpen] = useState(false);
  const [make, setMake] = useState(one(current.make) ?? "");
  const models = make ? modelsByMake[make] ?? [] : [];
  const activeCount = activeFilterCount(current);

  const field =
    "h-11 w-full rounded-lg border border-line bg-base px-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50";
  const legend = "mb-2.5 flex items-center gap-2 text-sm font-semibold text-ink";
  const sub = "mb-1.5 block text-xs text-ink-faint";

  const checkboxes = (
    name: string,
    values: readonly string[],
    label: (v: string) => string,
    scroll = false
  ) => {
    const selected = many(current[name as keyof CarFilters]);
    return (
      <div className={scroll ? "max-h-52 space-y-2 overflow-y-auto pr-1" : "space-y-2"}>
        {values.map((v) => (
          <label
            key={v}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <input
              type="checkbox"
              name={name}
              value={v}
              defaultChecked={selected.includes(v)}
              className="h-4 w-4 shrink-0 cursor-pointer accent-accent"
            />
            {label(v)}
          </label>
        ))}
      </div>
    );
  };

  const saleType = one(current.sale) ?? "";
  const saleOptions: [string, string][] = [
    ["", t("saleAll")],
    ["own", t("saleOwn")],
    ["consignment", t("saleConsignment")],
  ];

  return (
    <div className="lg:sticky lg:top-20">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-3 flex w-full items-center justify-between rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium text-ink lg:hidden"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Icon name="sliders" size={18} />
          {t("advancedFilters")}
          {activeCount > 0 && (
            <span className="rounded bg-accent px-1.5 py-0.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <Icon name="chevron-down" size={16} />
        </span>
      </button>

      <form
        method="get"
        className={`${open ? "block" : "hidden"} rounded-card border border-line bg-surface p-5 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto`}
      >
        {/* Sorting lives in the toolbar above the grid; carry it through so
            applying a filter does not silently reset the sort order. */}
        <input type="hidden" name="sort" value={sort} />

        <p className="mb-5 hidden items-center gap-2 font-display text-base font-semibold text-ink lg:flex">
          <span className="text-accent-hover">
            <Icon name="sliders" size={18} />
          </span>
          {t("advancedFilters")}
        </p>

        <div className="space-y-6">
          {/* Tip vanzare */}
          <fieldset>
            <legend className={legend}>
              <span className="text-accent-hover">
                <Icon name="tag" size={15} />
              </span>
              {t("saleType")}
            </legend>
            <div className="flex flex-wrap gap-2">
              {saleOptions.map(([value, label]) => (
                <label key={value || "all"} className="cursor-pointer">
                  <input
                    type="radio"
                    name="sale"
                    value={value}
                    defaultChecked={saleType === value}
                    className="peer sr-only"
                  />
                  <span className="inline-flex rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-line-strong peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className={legend}>{t("search")}</legend>
            <input
              name="q"
              defaultValue={one(current.q) ?? ""}
              placeholder={t("searchPlaceholder")}
              className={field}
            />
          </fieldset>

          <fieldset>
            <legend className={legend}>{t("makeModel")}</legend>
            <label className="block">
              <span className={sub}>{t("make")}</span>
              <select
                name="make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className={`${field} select-field`}
              >
                <option value="">{t("allMakes")}</option>
                {makes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block">
              <span className={sub}>{t("model")}</span>
              <select
                name="model"
                key={make}
                defaultValue={one(current.model) ?? ""}
                disabled={!make}
                className={`${field} select-field`}
              >
                <option value="">{make ? t("allModels") : t("selectMake")}</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>

          <fieldset>
            <legend className={legend}>{t("price")} (€)</legend>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="minPrice"
                type="number"
                min={0}
                step={100}
                inputMode="numeric"
                defaultValue={one(current.minPrice) ?? ""}
                placeholder={t("priceMinPh")}
                className={field}
                aria-label={t("priceMin")}
              />
              <input
                name="maxPrice"
                type="number"
                min={0}
                step={100}
                inputMode="numeric"
                defaultValue={one(current.maxPrice) ?? ""}
                placeholder={t("priceMaxPh")}
                className={field}
                aria-label={t("priceMax")}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className={legend}>{t("yearLabel")}</legend>
            <div className="grid grid-cols-2 gap-2">
              <select
                name="minYear"
                defaultValue={one(current.minYear) ?? ""}
                className={`${field} select-field`}
                aria-label={t("yearMin")}
              >
                <option value="">{t("yearAny")}</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                name="maxYear"
                defaultValue={one(current.maxYear) ?? ""}
                className={`${field} select-field`}
                aria-label={t("yearMax")}
              >
                <option value="">{t("yearAny")}</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          <fieldset>
            <legend className={legend}>{t("mileageMax")}</legend>
            <select
              name="maxMileage"
              defaultValue={one(current.maxMileage) ?? ""}
              className={`${field} select-field`}
            >
              <option value="">{t("mileageAny")}</option>
              {MILEAGE_LIMITS.map((m) => (
                <option key={m} value={m}>
                  {formatNumber(m)} km
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset>
            <legend className={legend}>{t("fuel")}</legend>
            {checkboxes("fuel", FUEL_TYPES, (v) => tf(v))}
          </fieldset>

          <fieldset>
            <legend className={legend}>{t("transmission")}</legend>
            {checkboxes("transmission", TRANSMISSIONS, (v) => tr(v))}
          </fieldset>

          <fieldset>
            <legend className={legend}>{t("drivetrain")}</legend>
            {checkboxes("drivetrain", DRIVETRAINS, (v) => td(v))}
          </fieldset>

          <fieldset>
            <legend className={legend}>{t("bodyTypeFilter")}</legend>
            {checkboxes("body", BODY_TYPES, (v) => tb(v))}
          </fieldset>

          <fieldset>
            <legend className={legend}>{t("euroNorm")}</legend>
            {checkboxes("euro", EURO_NORMS, (v) => te(v))}
          </fieldset>

          <fieldset>
            <legend className={legend}>{t("seats")}</legend>
            <select
              name="seats"
              defaultValue={one(current.seats) ?? ""}
              className={`${field} select-field`}
            >
              <option value="">{t("seatsAny")}</option>
              {SEAT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset>
            <legend className={legend}>
              <span className="text-accent-hover">
                <Icon name="sparkle" size={15} />
              </span>
              {t("featuresLabel")}
            </legend>
            {checkboxes("features", CAR_FEATURES, (v) => tft(v), true)}
          </fieldset>
        </div>

        <div className="sticky bottom-0 -mx-5 -mb-5 mt-6 flex gap-2 border-t border-line bg-surface px-5 py-4">
          <button type="submit" className="btn-primary h-11 flex-1">
            {t("apply")}
          </button>
          {activeCount > 0 && (
            <a
              href="?"
              className="btn-outline flex h-11 items-center px-3"
              title={t("resetAll")}
              aria-label={t("resetAll")}
            >
              <Icon name="x" size={16} />
            </a>
          )}
        </div>
      </form>
    </div>
  );
}
