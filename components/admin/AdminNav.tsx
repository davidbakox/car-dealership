"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The admin menu. On a phone it is one horizontally scrolling row of chips
// under the header; from md up it is the vertical sidebar list.
export default function AdminNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  // The dashboard's href is the admin root, which every other path starts
  // with — so it only counts as active on an exact match.
  const [root] = items;
  const isActive = (href: string) =>
    href === root.href
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="-mx-1 flex gap-1.5 overflow-x-auto px-3 pb-3 [scrollbar-width:none] md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:px-3 [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm transition md:rounded-lg md:px-3 ${
              active
                ? "bg-white/15 font-medium text-white"
                : "bg-white/5 text-slate-300 hover:bg-white/10 md:bg-transparent"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
