"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { saveAuctionAction } from "@/app/(admin)/admin-9f3k2/(protected)/actions";
import type { ActionState } from "@/lib/form-state";
import { t } from "@/lib/i18n/config";
import { ADMIN_PATH } from "@/lib/env";
import type { Auction, Car } from "@/lib/types";

const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand";

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

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time.
function toLocalInput(iso?: string): string {
  const d = iso ? new Date(iso) : new Date(Date.now() + 7 * 86400_000);
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

export default function AuctionForm({
  auction,
  cars,
}: {
  auction?: Auction;
  cars: Pick<Car, "id" | "title">[];
}) {
  const [state, formAction] = useFormState<ActionState, FormData>(
    saveAuctionAction,
    {}
  );
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {auction && <input type="hidden" name="id" value={auction.id} />}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          {t.admin_from_car} <span className="text-slate-400">(optional)</span>
        </span>
        <select
          name="car_id"
          defaultValue={auction?.car_id ?? ""}
          className={input}
        >
          <option value="">{t.admin_standalone}</option>
          {cars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            {t.auction_starting_price}
          </span>
          <input
            name="starting_price"
            type="number"
            step="0.01"
            defaultValue={auction?.starting_price}
            className={input}
            required
          />
          {fe.starting_price && (
            <span className="mt-1 block text-xs text-red-600">
              {fe.starting_price}
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Bid increment</span>
          <input
            name="bid_increment"
            type="number"
            step="0.01"
            defaultValue={auction?.bid_increment ?? 100}
            className={input}
            required
          />
          {fe.bid_increment && (
            <span className="mt-1 block text-xs text-red-600">
              {fe.bid_increment}
            </span>
          )}
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">End date &amp; time</span>
        <input
          name="ends_at"
          type="datetime-local"
          defaultValue={toLocalInput(auction?.ends_at)}
          className={input}
          required
        />
        {fe.ends_at && (
          <span className="mt-1 block text-xs text-red-600">{fe.ends_at}</span>
        )}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">{t.admin_status}</span>
        <select
          name="status"
          defaultValue={auction?.status ?? "open"}
          className={input}
        >
          <option value="open">open</option>
          <option value="closed">closed</option>
        </select>
      </label>

      <div className="flex items-center gap-3">
        <SaveButton />
        <Link
          href={`${ADMIN_PATH}/auctions`}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-600 hover:bg-slate-100"
        >
          {t.admin_cancel}
        </Link>
      </div>
    </form>
  );
}
