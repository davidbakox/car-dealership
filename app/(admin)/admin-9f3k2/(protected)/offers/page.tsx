import { requireAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n/config";
import { formatPrice, formatDateTime } from "@/lib/format";
import type { OfferWithContext } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// The mini-CRM: everyone who submitted an offer or inquiry, newest first,
// with a one-click CSV export (see /api/offers/export).
export default async function AdminOffersPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("offers")
    .select("*, car:cars(id, title), auction:auctions(id)")
    .order("created_at", { ascending: false });
  const offers = (data ?? []) as OfferWithContext[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.admin_offers}</h1>
        <a
          href="/api/offers/export"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light"
        >
          ⇩ {t.admin_export_csv}
        </a>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">{t.col_date}</th>
              <th className="p-3">{t.col_name}</th>
              <th className="p-3">{t.col_phone}</th>
              <th className="p-3">{t.col_email}</th>
              <th className="p-3">{t.col_amount}</th>
              <th className="p-3">{t.col_item}</th>
              <th className="p-3">{t.col_message}</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id} className="border-b border-slate-100 align-top">
                <td className="whitespace-nowrap p-3 text-slate-500">
                  {formatDateTime(o.created_at)}
                </td>
                <td className="p-3 font-medium">{o.buyer_name}</td>
                <td className="whitespace-nowrap p-3">{o.buyer_phone}</td>
                <td className="p-3">{o.buyer_email}</td>
                <td className="whitespace-nowrap p-3">{formatPrice(o.amount)}</td>
                <td className="p-3">
                  {o.car ? o.car.title : o.auction_id ? "Auction" : "—"}
                </td>
                <td className="max-w-xs p-3 text-slate-600">{o.message}</td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  {t.admin_no_offers}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
