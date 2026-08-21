import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <div className="mx-auto flex max-w-content flex-col items-center justify-center gap-4 px-4 py-28 text-center">
      <h1 className="font-display text-6xl font-semibold text-accent">404</h1>
      <Link href="/" className="btn-primary">
        {t("backHome")}
      </Link>
    </div>
  );
}
