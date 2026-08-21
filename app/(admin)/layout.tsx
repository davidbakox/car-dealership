import type { Metadata } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";

// Root layout for the NON-localized admin area. The admin UI is Hungarian only
// (per project decision), so lang is fixed to "hu". Separate from the public
// [locale] root layout — this is Next.js's "multiple root layouts" pattern.
export const metadata: Metadata = {
  title: "Admin — Dennis Cars",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu" className={fontVars}>
      <body className="min-h-screen bg-slate-50 text-slate-900 [color-scheme:light]">
        {children}
      </body>
    </html>
  );
}
