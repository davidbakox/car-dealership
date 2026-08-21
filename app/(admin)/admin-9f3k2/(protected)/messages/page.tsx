import { requireAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n/config";
import { formatDateTime } from "@/lib/format";
import type { ContactMessage } from "@/lib/types";
import { CONTACT_MESSAGE_MARKER } from "@/lib/contact";
import Icon from "@/components/ui/Icon";
import { deleteContactMessageAction } from "../actions";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Admin inbox for Contact-page submissions stored in the shared leads table.
export default async function AdminMessagesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("offers")
    .select("id, buyer_name, buyer_phone, buyer_email, message, created_at")
    .or(
      `buyer_phone.eq.${CONTACT_MESSAGE_MARKER},buyer_email.eq.${CONTACT_MESSAGE_MARKER}`
    )
    .order("created_at", { ascending: false });
  const messages: ContactMessage[] = (data ?? []).map((message) => ({
    id: message.id,
    name: message.buyer_name,
    phone:
      message.buyer_phone === CONTACT_MESSAGE_MARKER
        ? "—"
        : message.buyer_phone,
    message: message.message,
    created_at: message.created_at,
  }));

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
                <td className="p-3">{m.phone}</td>
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
                <td colSpan={5} className="p-6 text-center text-slate-500">
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
