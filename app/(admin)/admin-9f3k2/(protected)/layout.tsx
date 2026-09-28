import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "../logout/actions";
import { t } from "@/lib/i18n/config";
import { ADMIN_PATH } from "@/lib/env";
import AdminNav from "@/components/admin/AdminNav";

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

  // On a phone the shell is a sticky header (title + logout) with the menu as
  // a scrolling chip row beneath it; from md up it is the classic sidebar.
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="sticky top-0 z-30 shrink-0 bg-brand-dark text-slate-100 shadow-md md:static md:flex md:min-h-screen md:w-56 md:flex-col md:shadow-none">
        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3 md:p-4">
          <Link
            href={ADMIN_PATH}
            className="truncate text-base font-semibold md:text-lg"
          >
            {t.siteName} admin
          </Link>
          <form action={logoutAction} className="md:hidden">
            <button
              type="submit"
              className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
            >
              {t.admin_logout}
            </button>
          </form>
        </div>
        <AdminNav
          items={navItems.map((item) => ({
            href: `${ADMIN_PATH}${item.href}`,
            label: item.label,
          }))}
        />
        <form action={logoutAction} className="hidden p-3 md:block">
          <button
            type="submit"
            className="w-full rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            {t.admin_logout}
          </button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 bg-slate-50 px-3 py-5 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
