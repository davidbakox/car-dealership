"use client";

import { COOKIE_SETTINGS_OPEN_EVENT } from "@/lib/cookie-consent";

export default function CookieSettingsButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_OPEN_EVENT))}
    >
      {children}
    </button>
  );
}
