"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import ImageUploader from "./ImageUploader";
import { saveCarAction } from "@/app/(admin)/admin-9f3k2/(protected)/actions";
import type { ActionState } from "@/lib/form-state";
import { t } from "@/lib/i18n/config";
import { ADMIN_PATH } from "@/lib/env";
import {
  FUEL_TYPES,
  TRANSMISSIONS,
  CURRENCIES,
  BODY_TYPES,
  DRIVETRAINS,
  EURO_NORMS,
  CAR_FEATURES,
  type Car,
} from "@/lib/types";

// Admin-facing Hungarian labels for the catalogue attributes. The admin panel
// is Hungarian-only and does not run next-intl, so the public site's labels
// (messages/ro.json + messages/hu.json) can't be reused here.
const BODY_LABELS: Record<string, string> = {
  sedan: "Szedan", suv: "SUV", wagon: "Kombi", hatchback: "Ferdehatu",
  coupe: "Kupe", van: "Haszongepjarmu", minibus: "Kisbusz",
};
const DRIVETRAIN_LABELS: Record<string, string> = {
  fwd: "Elso kerek (2x4)", rwd: "Hatso kerek (2x4)", awd: "Osszkerek (4x4)",
};
const FEATURE_LABELS: Record<string, string> = {
  abs_esp_airbag: "ABS / ESP / Legzsak",
  electric_mirrors: "Elektromos tukrok",
  onboard_computer: "Fedelzeti computer",
  steering_controls: "Kormanykerek-vezerles",
  air_conditioning: "Klima",
  climate_control: "Digitalis klima",
  parking_sensors: "Tolatoradar",
  rear_camera: "Tolatokamera",
  cruise_control: "Tempomat",
  navigation: "Navigacio",
  heated_seats: "Futheto ulesek",
  led_xenon: "LED / Xenon fenyszoro",
  alloy_wheels: "Konnyufem felni",
  bluetooth: "Bluetooth",
  isofix: "ISOFIX",
  tow_bar: "Vonohorog",
};

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
        <Field label="Karosszeria" error={fe.body_type}>
          <select name="body_type" defaultValue={car?.body_type ?? ""} className={input}>
            <option value="">— nincs megadva —</option>
            {BODY_TYPES.map((b) => (
              <option key={b} value={b}>{BODY_LABELS[b]}</option>
            ))}
          </select>
        </Field>
        <Field label="Hajtas" error={fe.drivetrain}>
          <select name="drivetrain" defaultValue={car?.drivetrain ?? ""} className={input}>
            <option value="">— nincs megadva —</option>
            {DRIVETRAINS.map((d) => (
              <option key={d} value={d}>{DRIVETRAIN_LABELS[d]}</option>
            ))}
          </select>
        </Field>
        <Field label="Karosanyag-besorolas" error={fe.euro_norm}>
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
        <Field label="Ulesek szama" error={fe.seats}>
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

      {/* Badges shown over the photo on the listing tiles. Both are opt-in per
          car, so nothing is promised to a buyer unless it was ticked here. */}
      <div>
        <span className="mb-2 block text-sm font-medium">Jelvenyek a hirdetesen</span>
        <div className="space-y-2">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              name="is_consignment"
              defaultChecked={car?.is_consignment}
              className="mt-0.5 h-4 w-4"
            />
            <span className="text-sm">
              Konszignacios auto
              <span className="block text-xs text-slate-500">
                Barna jelveny: &bdquo;Se cumpara direct de la proprietar&rdquo; / &bdquo;Kozvetlenul a
                tulajdonostol&rdquo;, plusz szurheto a &bdquo;Tip vanzare&rdquo; blokkban.
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
              Hazhozszallitassal
              <span className="block text-xs text-slate-500">
                Sotet jelveny teherauto ikonnal: &bdquo;Masina vine la tine acasa!&rdquo; / &bdquo;Az autot
                hazhoz visszuk!&rdquo; Csak akkor pipald be, ha tenyleg vallaljatok.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium">Felszereltseg</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CAR_FEATURES.map((f) => (
            <label key={f} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="features"
                value={f}
                defaultChecked={car?.features?.includes(f)}
                className="h-4 w-4"
              />
              {FEATURE_LABELS[f]}
            </label>
          ))}
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
