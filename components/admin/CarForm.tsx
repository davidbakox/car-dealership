"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import ImageUploader from "./ImageUploader";
import ColorSwatch from "@/components/ui/ColorSwatch";
import { saveCarAction } from "@/app/(admin)/admin-9f3k2/(protected)/actions";
import type { ActionState } from "@/lib/form-state";
import { t } from "@/lib/i18n/config";
import {
  BODY_LABELS,
  DRIVETRAIN_LABELS,
  COLOR_LABELS,
  FEATURE_LABELS,
  FEATURE_GROUP_LABELS,
} from "@/lib/i18n/admin-catalog";
import { ADMIN_PATH } from "@/lib/env";
import {
  FUEL_TYPES,
  TRANSMISSIONS,
  CURRENCIES,
  BODY_TYPES,
  DRIVETRAINS,
  EURO_NORMS,
  CAR_COLORS,
  FEATURE_GROUPS,
  type Car,
} from "@/lib/types";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-light disabled:opacity-60"
    >
      {pending ? t.admin_saving : t.admin_save}
    </button>
  );
}

const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export default function CarForm({ car }: { car?: Car }) {
  const [state, formAction] = useFormState<ActionState, FormData>(
    saveCarAction,
    {}
  );
  const fe = state.fieldErrors ?? {};

  // Equipment is controlled so each group can show how many boxes are ticked
  // and offer an all/none shortcut — with ~70 options, hunting through plain
  // checkboxes to see what a car already has is the slow part of the job.
  const [features, setFeatures] = useState<Set<string>>(
    () => new Set(car?.features ?? [])
  );
  const toggleFeature = (f: string) =>
    setFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  const setGroup = (items: readonly string[], on: boolean) =>
    setFeatures((prev) => {
      const next = new Set(prev);
      for (const i of items) {
        if (on) next.add(i);
        else next.delete(i);
      }
      return next;
    });

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {car && <input type="hidden" name="id" value={car.id} />}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Field label="Title" error={fe.title}>
        <input name="title" defaultValue={car?.title} className={input} required />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.spec_make} error={fe.make}>
          <input name="make" defaultValue={car?.make} className={input} required />
        </Field>
        <Field label={t.spec_model} error={fe.model}>
          <input name="model" defaultValue={car?.model} className={input} required />
        </Field>
        <Field label={t.spec_year} error={fe.year}>
          <input
            name="year"
            type="number"
            defaultValue={car?.year ?? new Date().getFullYear()}
            className={input}
            required
          />
        </Field>
        <Field label={`${t.spec_mileage} (km)`} error={fe.mileage}>
          <input
            name="mileage"
            type="number"
            defaultValue={car?.mileage ?? 0}
            className={input}
            required
          />
        </Field>
        <Field label={t.spec_fuel} error={fe.fuel_type}>
          <select name="fuel_type" defaultValue={car?.fuel_type} className={input}>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.spec_transmission} error={fe.transmission}>
          <select
            name="transmission"
            defaultValue={car?.transmission}
            className={input}
          >
            {TRANSMISSIONS.map((tr) => (
              <option key={tr} value={tr}>
                {tr}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Price" error={fe.price}>
          <input
            name="price"
            type="number"
            step="0.01"
            defaultValue={car?.price}
            className={input}
            required
          />
        </Field>
        <Field label="Currency" error={fe.currency}>
          <select
            name="currency"
            defaultValue={car?.currency ?? "EUR"}
            className={input}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Catalogue attributes — all optional, so a car can go live before
          every spec is known. They drive the public filters and car cards. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Karosszéria" error={fe.body_type}>
          <select name="body_type" defaultValue={car?.body_type ?? ""} className={input}>
            <option value="">— nincs megadva —</option>
            {BODY_TYPES.map((b) => (
              <option key={b} value={b}>{BODY_LABELS[b]}</option>
            ))}
          </select>
        </Field>
        <Field label="Hajtás" error={fe.drivetrain}>
          <select name="drivetrain" defaultValue={car?.drivetrain ?? ""} className={input}>
            <option value="">— nincs megadva —</option>
            {DRIVETRAINS.map((d) => (
              <option key={d} value={d}>{DRIVETRAIN_LABELS[d]}</option>
            ))}
          </select>
        </Field>
        <Field label="Károsanyag-besorolás" error={fe.euro_norm}>
          <select name="euro_norm" defaultValue={car?.euro_norm ?? ""} className={input}>
            <option value="">— nincs megadva —</option>
            {EURO_NORMS.map((e) => (
              <option key={e} value={e}>{e.replace("euro", "EURO ")}</option>
            ))}
          </select>
        </Field>
        <Field label="Motor (pl. 2.0 TDI)" error={fe.engine}>
          <input name="engine" defaultValue={car?.engine ?? ""} className={input} />
        </Field>
        <Field label="Ülések száma" error={fe.seats}>
          <input
            name="seats"
            type="number"
            min={1}
            max={9}
            defaultValue={car?.seats ?? ""}
            className={input}
          />
        </Field>
      </div>

      {/* Paint colour. Radios rather than a <select> so the actual colour is
          visible while choosing — the same swatch the public page draws. */}
      <div>
        <span className="mb-2 block text-sm font-medium">Szín</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="color"
              value=""
              defaultChecked={!car?.color}
              className="peer sr-only"
            />
            <span className="flex items-center gap-2 rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-500 peer-checked:border-brand peer-checked:bg-brand/5 peer-checked:text-slate-900 peer-checked:ring-1 peer-checked:ring-brand peer-focus-visible:ring-2">
              <span className="h-4 w-4 shrink-0 rounded-full border border-dashed border-slate-400" />
              Nincs megadva
            </span>
          </label>
          {CAR_COLORS.map((c) => (
            <label key={c} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={c}
                defaultChecked={car?.color === c}
                className="peer sr-only"
              />
              <span className="flex items-center gap-2 rounded-lg border border-slate-300 px-2.5 py-2 text-sm peer-checked:border-brand peer-checked:bg-brand/5 peer-checked:font-medium peer-checked:ring-1 peer-checked:ring-brand peer-focus-visible:ring-2">
                <ColorSwatch color={c} size={16} />
                {COLOR_LABELS[c]}
              </span>
            </label>
          ))}
        </div>
        {fe.color && <span className="mt-1 block text-xs text-red-600">{fe.color}</span>}
      </div>

      {/* Badges shown over the photo on the listing tiles. Both are opt-in per
          car, so nothing is promised to a buyer unless it was ticked here. */}
      <div>
        <span className="mb-2 block text-sm font-medium">Jelvények a hirdetésen</span>
        <div className="space-y-2">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="is_consignment"
              defaultChecked={car?.is_consignment}
              className="mt-0.5 h-4 w-4"
            />
            <span className="text-sm">
              Konszignációs autó
              <span className="block text-xs text-slate-500">
                Barna jelvény a fotón: &bdquo;Direct de la proprietar&rdquo; /
                &bdquo;Tulajdonostól&rdquo;, plusz szűrhető a &bdquo;Tip vânzare&rdquo; blokkban.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="has_home_delivery"
              defaultChecked={car?.has_home_delivery}
              className="mt-0.5 h-4 w-4"
            />
            <span className="text-sm">
              Házhozszállítással
              <span className="block text-xs text-slate-500">
                Sötét jelvény teherautó ikonnal: &bdquo;Livrare la domiciliu&rdquo; /
                &bdquo;Házhozszállítás&rdquo;. Csak akkor pipáld be, ha tényleg vállaljátok.
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Equipment, grouped exactly like the public car page renders it. */}
      <div>
        <span className="mb-2 block text-sm font-medium">
          Felszereltség
          <span className="ml-2 text-xs font-normal text-slate-500">
            {features.size} kiválasztva
          </span>
        </span>
        <div className="space-y-3">
          {FEATURE_GROUPS.map((g) => {
            const count = g.items.filter((i) => features.has(i)).length;
            const allOn = count === g.items.length;
            return (
              <fieldset
                key={g.key}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
              >
                <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
                  {FEATURE_GROUP_LABELS[g.key]}
                  <span className="text-xs font-normal text-slate-500">
                    ({count}/{g.items.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setGroup(g.items, !allOn)}
                    className="text-xs font-normal text-brand underline-offset-2 hover:underline"
                  >
                    {allOn ? "egyiket sem" : "mindet"}
                  </button>
                </legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {g.items.map((f) => (
                    <label key={f} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="features"
                        value={f}
                        checked={features.has(f)}
                        onChange={() => toggleFeature(f)}
                        className="h-4 w-4"
                      />
                      {FEATURE_LABELS[f]}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}
        </div>
      </div>

      <Field label={t.car_description} error={fe.description}>
        <textarea
          name="description"
          defaultValue={car?.description}
          rows={5}
          className={input}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.admin_status} error={fe.status}>
          <select name="status" defaultValue={car?.status ?? "available"} className={input}>
            <option value="available">{t.status_available}</option>
            <option value="reserved">{t.status_reserved}</option>
            <option value="sold">{t.status_sold}</option>
          </select>
        </Field>
        <label className="flex items-end gap-2 pb-2">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={car?.is_featured}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">{t.admin_mark_featured}</span>
        </label>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium">{t.admin_images}</span>
        <ImageUploader initial={car?.images ?? []} />
      </div>

      <div className="flex items-center gap-3">
        <SaveButton />
        <Link
          href={`${ADMIN_PATH}/cars`}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-600 hover:bg-slate-100"
        >
          {t.admin_cancel}
        </Link>
      </div>
    </form>
  );
}
