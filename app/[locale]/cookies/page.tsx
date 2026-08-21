import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import LegalDocument from "@/components/public/LegalDocument";
import { getLegalContent } from "@/lib/legal-content";

export const runtime = "edge";

export function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Metadata {
  const content = getLegalContent(locale, "cookies");
  return { title: content.title, description: content.description };
}

export default function CookiesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return <LegalDocument content={getLegalContent(locale, "cookies")} />;
}
