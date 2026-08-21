import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n/config";
import { ADMIN_PATH } from "@/lib/env";
import { formatPrice, formatDateTime } from "@/lib/format";
import type { AuctionWithCar, Offer } from "@/lib/types";
import { closeAuctionAction } from "../../actions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Auction detail (admin): shows all submitted offers sorted by amount, plus a
// manual "close auction" control.
export default async function AdminAuctionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { supabase } = await requireAdmin();

  const { data: auctionData } = await supabase
    .from("auctions")
    .select("*, car:cars(*)")
    .eq("id", params.id)
    .single();
  if (!auctionData) notFound();
  const auction = auctionData as AuctionWithCar;

  const { data: offersData } = await supabase
    .from("offers")
    .select("*")
    .eq("auction_id", params.id)
    .order("amount", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  const offers = (offersData ?? []) as Offer[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`${ADMIN_PATH}/auctions`}
            className="text-sm text-brand hover:underline"
          >
            ← {t.admin_auctions}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {auction.car ? auction.car.title : "Standalone auction"}
          </h1>
        </div>
        {auction.status === "open" && (
          <form action={closeAuctionAction}>
            <input type="hidden" name="id" value={auction.id} />
            <button
              type="submit"
              className="rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-200"
            >
              {t.admin_close_auction}
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Info label={t.auction_starting_price} value={formatPrice(auction.starting_price)} />
        <Info label={t.auction_current_offer} value={formatPrice(auction.current_highest_offer)} />
        <Info label={t.auction_ends_in} value={formatDateTime(auction.ends_at)} />
        <Info label={t.admin_status} value={auction.status} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">
          {t.admin_offers_for}{" "}
          <span className="text-sm font-normal text-slate-500">
            ({t.admin_sorted_by_amount})
          </span>
        </h2>
        {offers.length === 0 ? (
          <p className="text-sm text-slate-500">{t.auction_no_offers}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-4">{t.col_amount}</th>
                  <th className="py-2 pr-4">{t.col_name}</th>
                  <th className="py-2 pr-4">{t.col_phone}</th>
                  <th className="py-2 pr-4">{t.col_email}</th>
                  <th className="py-2 pr-4">{t.col_date}</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o, i) => (
                  <tr key={o.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-semibold">
                      {formatPrice(o.amount)}
                      {i === 0 && (
                        <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-800">
                          Top
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4">{o.buyer_name}</td>
                    <td className="py-2 pr-4">{o.buyer_phone}</td>
                    <td className="py-2 pr-4">{o.buyer_email}</td>
                    <td className="py-2 pr-4 text-slate-500">
                      {formatDateTime(o.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
