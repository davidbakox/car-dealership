import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/env";
import SiteHeader from "@/components/public/SiteHeader";
import SiteFooter from "@/components/public/SiteFooter";
import TopBar from "@/components/public/TopBar";
import CookieConsent from "@/components/public/CookieConsent";
import RecoveryRedirect from "@/components/auth/RecoveryRedirect";

export const runtime = "edge";

// Pre-render both locales' layouts.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("homeTitle"),
      template: "%s · Dennis Cars Carei",
    },
    description: t("homeDescription"),
    openGraph: { siteName: "Dennis Cars Carei", type: "website" },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={fontVars}>
      <body className="min-h-screen bg-base text-ink">
        <NextIntlClientProvider messages={messages}>
          <RecoveryRedirect />
          <div className="flex min-h-screen flex-col">
            <TopBar />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CookieConsent />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
