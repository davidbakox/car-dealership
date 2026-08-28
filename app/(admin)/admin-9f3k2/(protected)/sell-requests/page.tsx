import { requireAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n/config";
import { formatDateTime } from "@/lib/format";
import {
  isSellRequestMessage,
  stripSellRequestMarker,
} from "@/lib/inbox";
import type { Offer } from "@/lib/types";
import Icon from "@/components/ui/Icon";
import { deleteSellRequestAction } from "../actions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Both markers, and the stripping of them, live in lib/inbox so this page and
// the inbox can never disagree about which rows are sell requests.
const isSellRequest = (offer: Offer) => isSellRequestMessage(offer.message);
const requestDetails = stripSellRequestMarker;

export default async function AdminSellRequestsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("offers")
    .select("*")
    .is("car_id", null)
    .is("auction_id", null)
    .order("created_at", { ascending: false });

  const requests = ((data ?? []) as Offer[]).filter(isSellRequest);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.admin_sell_requests}</h1>
        <p className="mt-1 text-sm text-slate-500">
          A „Vinde mașina ta” űrlapról érkező konszignációs kérelmek.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">{t.col_date}</th>
              <th className="p-3">{t.col_name}</th>
              <th className="p-3">{t.col_phone}</th>
              <th className="p-3">{t.col_email}</th>
              <th className="p-3">Autó és üzenet</th>
              <th className="w-16 p-3" aria-label={t.admin_delete} />
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                className="border-b border-slate-100 align-top last:border-b-0"
              >
                <td className="whitespace-nowrap p-3 text-slate-500">
                  {formatDateTime(request.created_at)}
                </td>
                <td className="p-3 font-medium">{request.buyer_name}</td>
                <td className="whitespace-nowrap p-3">
                  <a
                    href={`tel:${request.buyer_phone}`}
                    className="hover:text-brand hover:underline"
                  >
                    {request.buyer_phone}
                  </a>
                </td>
                <td className="p-3">
                  <a
                    href={`mailto:${request.buyer_email}`}
                    className="hover:text-brand hover:underline"
                  >
                    {request.buyer_email}
                  </a>
                </td>
                <td className="max-w-lg whitespace-pre-wrap p-3 text-slate-700">
                  {requestDetails(request.message)}
                </td>
                <td className="p-3 text-right">
                  <form action={deleteSellRequestAction}>
                    <input type="hidden" name="id" value={request.id} />
                    <button
                      type="submit"
                      title={t.admin_delete}
                      aria-label={t.admin_delete}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  {t.admin_no_sell_requests}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
