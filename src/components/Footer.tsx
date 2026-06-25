"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

/**
 * Subtle attribution credit shown at the bottom of every page.
 * Intentionally low-contrast (opacity-40) and lightweight so it never
 * competes with the main content.
 */
export default function Footer({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <footer
      className={`text-center text-xs font-light text-[#5b4a61] opacity-40 ${className}`}
    >
      {t("footer.madeBy")}
    </footer>
  );
}
