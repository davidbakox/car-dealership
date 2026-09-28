import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n/config";
import { ADMIN_PATH } from "@/lib/env";
import { formatPrice, formatNumber } from "@/lib/format";
import type { Car } from "@/lib/types";
import {
  deleteCarAction,
  updateCarFlagsAction,
} from "../actions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const statusLabel: Record<Car["status"], string> = {
  available: t.status_available,
  sold: t.status_sold,
  reserved: t.status_reserved,
};

export default async function AdminCarsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("cars")
    .select("*")
    .order("created_at", { ascending: false });
  const cars = (data ?? []) as Car[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.admin_cars}</h1>
        <Link
          href={`${ADMIN_PATH}/cars/new/edit`}
          className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-light"
        >
          + {t.admin_new_car}
        </Link>
      </div>

      {/* Phone: one card per car with big tap targets. The table below takes
          over from md up. */}
      <div className="space-y-3 md:hidden">
        {cars.map((car) => (
          <div
            key={car.id}
            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <Link
              href={`${ADMIN_PATH}/cars/${car.id}/edit`}
              className="flex gap-3"
            >
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {car.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={car.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 font-medium leading-snug">
                  {car.title}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {car.year} · {formatNumber(car.mileage)} km · {car.fuel_type}
                </div>
                <div className="mt-1 font-semibold text-brand">
                  {formatPrice(car.price, car.currency)}
                </div>
              </div>
            </Link>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <form action={updateCarFlagsAction} className="flex items-center gap-1">
                <input type="hidden" name="id" value={car.id} />
                <select
                  name="status"
                  defaultValue={car.status}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                >
                  {(["available", "reserved", "sold"] as const).map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s]}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200"
                >
                  Set
                </button>
              </form>
              <form action={updateCarFlagsAction}>
                <input type="hidden" name="id" value={car.id} />
                <input
                  type="hidden"
                  name="is_featured"
                  value={(!car.is_featured).toString()}
                />
                <button
                  type="submit"
                  className={`rounded-lg px-3 py-2 text-sm ${
                    car.is_featured
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {car.is_featured ? "★" : "☆"}
                </button>
              </form>
              <div className="ml-auto flex gap-2">
                <Link
                  href={`${ADMIN_PATH}/cars/${car.id}/edit`}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200"
                >
                  Edit
                </Link>
                <form action={deleteCarAction}>
                  <input type="hidden" name="id" value={car.id} />
                  <button
                    type="submit"
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                  >
                    {t.admin_delete}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {cars.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No cars yet. Create your first listing.
          </p>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">Car</th>
              <th className="p-3">Price</th>
              <th className="p-3">{t.admin_status}</th>
              <th className="p-3">{t.admin_mark_featured}</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id} className="border-b border-slate-100">
                <td className="p-3">
                  <div className="font-medium">{car.title}</div>
                  <div className="text-xs text-slate-500">
                    {car.year} · {formatNumber(car.mileage)} km · {car.fuel_type}
                  </div>
                </td>
                <td className="p-3">{formatPrice(car.price, car.currency)}</td>
                <td className="p-3">
                  {/* Inline status change without opening the editor. */}
                  <form action={updateCarFlagsAction}>
                    <input type="hidden" name="id" value={car.id} />
                    <select
                      name="status"
                      defaultValue={car.status}
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      {(["available", "reserved", "sold"] as const).map((s) => (
                        <option key={s} value={s}>
                          {statusLabel[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="ml-1 rounded bg-slate-100 px-2 py-1 text-xs hover:bg-slate-200"
                    >
                      Set
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={updateCarFlagsAction}>
                    <input type="hidden" name="id" value={car.id} />
                    <input
                      type="hidden"
                      name="is_featured"
                      value={(!car.is_featured).toString()}
                    />
                    <button
                      type="submit"
                      className={`rounded px-2 py-1 text-xs ${
                        car.is_featured
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {car.is_featured ? "★ Featured" : "☆ Feature"}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`${ADMIN_PATH}/cars/${car.id}/edit`}
                      className="rounded bg-slate-100 px-3 py-1 text-xs hover:bg-slate-200"
                    >
                      Edit
                    </Link>
                    <form action={deleteCarAction}>
                      <input type="hidden" name="id" value={car.id} />
                      <button
                        type="submit"
                        className="rounded bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100"
                      >
                        {t.admin_delete}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {cars.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No cars yet. Create your first listing.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
