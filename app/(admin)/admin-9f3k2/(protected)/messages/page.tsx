import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n/config";
import { ADMIN_PATH } from "@/lib/env";
import { formatDateTime } from "@/lib/format";
import {
  INBOX_SELECT,
  isInboxRow,
  toInboxMessage,
  type InboxRow,
} from "@/lib/inbox";
import Icon from "@/components/ui/Icon";
import { deleteContactMessageAction } from "../actions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// The single inbox: Contact-page submissions AND questions asked from a car's
// page, which previously landed in the table with nowhere in the panel to read
// them. Sell requests and auction offers keep their own screens.
export default async function AdminMessagesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("offers")
    .select(INBOX_SELECT)
    .is("auction_id", null)
    .order("created_at", { ascending: false });

  const messages = ((data ?? []) as unknown as InboxRow[])
    .filter(isInboxRow)
    .map(toInboxMessage);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t.admin_messages}</h1>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="p-3">{t.col_date}</th>
              <th className="p-3">{t.col_name}</th>
              <th className="p-3">{t.col_phone}</th>
              <th className="p-3">{t.col_email}</th>
              <th className="p-3">{t.col_subject}</th>
              <th className="p-3">{t.col_message}</th>
              <th className="w-16 p-3" aria-label={t.admin_delete} />
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id} className="border-b border-slate-100 align-top">
                <td className="whitespace-nowrap p-3 text-slate-500">
                  {formatDateTime(m.created_at)}
                </td>
                <td className="p-3 font-medium">{m.name}</td>
                <td className="whitespace-nowrap p-3">{m.phone}</td>
                <td className="p-3">{m.email}</td>
                <td className="p-3">
                  {m.car ? (
                    <Link
                      href={`${ADMIN_PATH}/cars/${m.car.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand/15"
                    >
                      <Icon name="car" size={14} />
                      {m.car.title}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <Icon name="mail" size={14} />
                      {m.source === "contact"
                        ? t.msg_from_contact_form
                        : t.msg_from_car_inquiry}
                    </span>
                  )}
                </td>
                <td className="max-w-md p-3 text-slate-600">{m.message}</td>
                <td className="p-3 text-right">
                  <form action={deleteContactMessageAction}>
                    <input type="hidden" name="id" value={m.id} />
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
            {messages.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  {t.admin_no_messages}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
