import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n/config";
import { ADMIN_PATH } from "@/lib/env";
import { formatDateTime } from "@/lib/format";
import type { ContactMessage, Offer } from "@/lib/types";
import {
  CONTACT_MESSAGE_MARKER,
  SELL_REQUEST_MARKER,
} from "@/lib/contact";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-3xl font-semibold text-brand">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

  // Run the dashboard counts + latest contact messages in parallel.
  const [
    carsCount,
    auctionsCount,
    offersCount,
    recent,
    recentSellRequests,
    legacySellRequests,
  ] = await Promise.all([
    supabase.from("cars").select("id", { count: "exact", head: true }),
    supabase
      .from("auctions")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    supabase
      .from("offers")
      .select("id, buyer_name, buyer_phone, buyer_email, message, created_at")
      .or(
        `buyer_phone.eq.${CONTACT_MESSAGE_MARKER},buyer_email.eq.${CONTACT_MESSAGE_MARKER}`
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("offers")
      .select("id, buyer_name, buyer_phone, message, created_at")
      .like("message", `${SELL_REQUEST_MARKER}%`)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("offers")
      .select("id, buyer_name, buyer_phone, message, created_at")
      .like("message", "[VÂNZARE]%")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const messages: ContactMessage[] = (recent.data ?? []).map((message) => ({
    id: message.id,
    name: message.buyer_name,
    phone:
      message.buyer_phone === CONTACT_MESSAGE_MARKER
        ? "—"
        : message.buyer_phone,
    message: message.message,
    created_at: message.created_at,
  }));

  const sellRequests = [
    ...(recentSellRequests.data ?? []),
    ...(legacySellRequests.data ?? []),
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5) as Pick<
    Offer,
    "id" | "buyer_name" | "buyer_phone" | "message" | "created_at"
  >[];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">{t.admin_dashboard}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t.stat_cars_listed} value={carsCount.count ?? 0} />
        <StatCard label={t.stat_open_auctions} value={auctionsCount.count ?? 0} />
        <StatCard label={t.stat_new_offers} value={offersCount.count ?? 0} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">{t.recent_messages}</h2>
          <Link
            href={`${ADMIN_PATH}/messages`}
            className="text-sm text-brand hover:underline"
          >
            {t.admin_messages} →
          </Link>
        </div>

        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">{t.admin_no_messages}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map((message) => (
              <Link
                key={message.id}
                href={`${ADMIN_PATH}/messages`}
                className="group grid gap-1 rounded-lg px-3 py-3 transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-6"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-slate-900">
                      {message.name}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {message.phone}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-600 group-hover:text-slate-900">
                    {message.message}
                  </p>
                </div>
                <span className="text-xs text-slate-400 sm:pt-1">
                  {formatDateTime(message.created_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">{t.recent_sell_requests}</h2>
          <Link
            href={`${ADMIN_PATH}/sell-requests`}
            className="text-sm text-brand hover:underline"
          >
            {t.admin_sell_requests} →
          </Link>
        </div>

        {sellRequests.length === 0 ? (
          <p className="text-sm text-slate-500">
            {t.admin_no_sell_requests}
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {sellRequests.map((request) => (
              <Link
                key={request.id}
                href={`${ADMIN_PATH}/sell-requests`}
                className="group grid gap-1 rounded-lg px-3 py-3 transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-6"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-slate-900">
                      {request.buyer_name}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {request.buyer_phone}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-600 group-hover:text-slate-900">
                    {request.message
                      .replace(SELL_REQUEST_MARKER, "")
                      .replace("[VÂNZARE]", "")
                      .trim()}
                  </p>
                </div>
                <span className="text-xs text-slate-400 sm:pt-1">
                  {formatDateTime(request.created_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
