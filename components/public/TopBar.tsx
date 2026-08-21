import { getTranslations } from "next-intl/server";
import Icon from "@/components/ui/Icon";
import { PHONE, PHONE_HREF } from "@/lib/contact";

// Thin utility strip above the main header — phone + hours always visible,
// the kind of detail that signals "real local business" rather than a template.
export default async function TopBar() {
  const t = await getTranslations("contact");
  return (
    <div className="hidden border-b border-line bg-base text-xs text-ink-muted md:block">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-2">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <Icon name="pin" size={14} />
            {t("address")}
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="clock" size={14} />
            {t("hoursValue")}
          </span>
        </div>
        <a
          href={PHONE_HREF}
          className="flex items-center gap-1.5 font-medium text-ink transition-colors hover:text-accent"
        >
          <Icon name="phone" size={14} />
          {PHONE}
        </a>
      </div>
    </div>
  );
}
