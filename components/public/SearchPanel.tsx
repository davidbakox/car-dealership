"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Icon from "@/components/ui/Icon";
import { FUEL_TYPES, TRANSMISSIONS, BODY_TYPES } from "@/lib/types";
import { YEARS } from "@/lib/car-filters";

// Marketplace-style quick search that sits in the hero. A plain GET form
// posting to the localized listings page, so it works with zero JS and lands on
// shareable filter URLs. `action` is the locale-correct /cars path.
//
// The one bit of state is the Model dropdown: it stays disabled until a make is
// picked, then lists only that make's models (from `modelsByMake`).
export default function SearchPanel({
  makes,
  modelsByMake,
  action,
}: {
  makes: string[];
  modelsByMake: Record<string, string[]>;
  action: string;
}) {
  const t = useTranslations("cars");
  const th = useTranslations("home");
  const tf = useTranslations("fuel");
  const tr = useTranslations("transmission");
  const tb = useTranslations("bodyType");

  const [make, setMake] = useState("");
  const models = make ? modelsByMake[make] ?? [] : [];

  const label =
    "mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-faint";
  const field =
    "h-12 w-full rounded-lg border border-line bg-base px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form
      method="get"
      action={action}
      className="rounded-card border border-line bg-surface/95 p-4 shadow-xl shadow-black/40 backdrop-blur sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded bg-accent-soft text-accent-hover">
          <Icon name="search" size={15} />
        </span>
        {th("searchTitle")}
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        <label className="block">
          <span className={label}>{t("make")}</span>
          <select
            name="make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className={`${field} select-field`}
          >
            <option value="">{t("allMakes")}</option>
            {makes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={label}>{t("model")}</span>
          <select
            name="model"
            defaultValue=""
            disabled={!make}
            key={make} /* reset the choice when the make changes */
            className={`${field} select-field`}
          >
            <option value="">{make ? t("allModels") : t("selectMake")}</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={label}>{t("bodyType")}</span>
          <select name="body" defaultValue="" className={`${field} select-field`}>
            <option value="">{t("allBodyTypes")}</option>
            {BODY_TYPES.map((b) => (
              <option key={b} value={b}>{tb(b)}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={label}>{t("fuel")}</span>
          <select name="fuel" defaultValue="" className={`${field} select-field`}>
            <option value="">{t("allFuels")}</option>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>{tf(f)}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={label}>{t("transmission")}</span>
          <select name="transmission" defaultValue="" className={`${field} select-field`}>
            <option value="">{t("allTransmissions")}</option>
            {TRANSMISSIONS.map((x) => (
              <option key={x} value={x}>{tr(x)}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={label}>{t("yearFrom")}</span>
          <select name="minYear" defaultValue="" className={`${field} select-field`}>
            <option value="">{t("yearAny")}</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={label}>{t("priceMaxLabel")}</span>
          <input
            name="maxPrice"
            type="number"
            min={0}
            step={100}
            inputMode="numeric"
            placeholder={t("priceMaxPh")}
            className={field}
          />
        </label>

        <label className="block">
          <span className={label}>{t("mileageMax")}</span>
          <input
            name="maxMileage"
            type="number"
            min={0}
            step={1000}
            inputMode="numeric"
            placeholder={t("mileageMaxPh")}
            className={field}
          />
        </label>
      </div>

      <button
        type="submit"
        className="btn-primary mt-5 flex w-full items-center justify-center gap-2 py-4 text-base"
      >
        <Icon name="search" size={18} />
        {th("searchButton")}
      </button>
    </form>
  );
}
