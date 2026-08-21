import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n/config";
import { ADMIN_PATH } from "@/lib/env";
import { formatPrice, formatDateTime } from "@/lib/format";
import type { AuctionWithCar } from "@/lib/types";
import { closeAuctionAction, deleteAuctionAction } from "../actions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminAuctionsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("auctions")
    .select("*, car:cars(*)")
    .order("created_at", { ascending: false });
  const auctions = (data ?? []) as AuctionWithCar[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.admin_auctions}</h1>
        <Link
          href={`${ADMIN_PATH}/auctions/new/edit`}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light"
        >
          + {t.admin_new_auction}
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">Item</th>
              <th className="p-3">Start</th>
              <th className="p-3">Highest</th>
              <th className="p-3">Ends</th>
              <th className="p-3">{t.admin_status}</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map((a) => (
              <tr key={a.id} className="border-b border-slate-100">
                <td className="p-3 font-medium">
                  {a.car ? a.car.title : "Standalone auction"}
                </td>
                <td className="p-3">{formatPrice(a.starting_price)}</td>
                <td className="p-3">{formatPrice(a.current_highest_offer)}</td>
                <td className="p-3 text-slate-500">
                  {formatDateTime(a.ends_at)}
                </td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      a.status === "open"
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`${ADMIN_PATH}/auctions/${a.id}`}
                      className="rounded bg-slate-100 px-3 py-1 text-xs hover:bg-slate-200"
                    >
                      Offers
                    </Link>
                    <Link
                      href={`${ADMIN_PATH}/auctions/${a.id}/edit`}
                      className="rounded bg-slate-100 px-3 py-1 text-xs hover:bg-slate-200"
                    >
                      Edit
                    </Link>
                    {a.status === "open" && (
                      <form action={closeAuctionAction}>
                        <input type="hidden" name="id" value={a.id} />
                        <button
                          type="submit"
                          className="rounded bg-amber-50 px-3 py-1 text-xs text-amber-800 hover:bg-amber-100"
                        >
                          {t.admin_close_auction}
                        </button>
                      </form>
                    )}
                    <form action={deleteAuctionAction}>
                      <input type="hidden" name="id" value={a.id} />
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
            {auctions.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No auctions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
