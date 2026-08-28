import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../logout/actions";
import { t } from "@/lib/i18n/config";
import { ADMIN_PATH } from "@/lib/env";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const navItems = [
  { href: "", label: t.admin_dashboard },
  { href: "/cars", label: t.admin_cars },
  { href: "/sell-requests", label: t.admin_sell_requests },
  { href: "/messages", label: t.admin_messages },
  // Every lead in one table with a CSV export. The page existed but was
  // unreachable — nothing linked to it.
  { href: "/offers", label: t.admin_offers },
];

// Guarded admin shell. requireAdmin() verifies the session server-side BEFORE
// any child page loads data, so admin data never renders for an anon request.
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="shrink-0 border-b border-slate-200 bg-brand-dark text-slate-100 md:w-56 md:border-b-0 md:border-r">
        <div className="p-4 text-lg font-semibold">{t.siteName} admin</div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible md:px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={`${ADMIN_PATH}${item.href}`}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="p-3">
          <button
            type="submit"
            className="w-full rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            {t.admin_logout}
          </button>
        </form>
      </aside>
      <main className="flex-1 bg-slate-50 p-4 md:p-8">{children}</main>
    </div>
  );
}
