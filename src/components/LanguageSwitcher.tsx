"use client";

import { LOCALES, LOCALE_LABELS, LOCALE_NAMES } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className="flex items-center gap-0.5 rounded-full border border-white/60 bg-white/70 p-0.5 shadow-soft backdrop-blur-md"
    >
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            onClick={() => setLocale(l)}
            aria-pressed={active}
            title={LOCALE_NAMES[l]}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
              active
                ? "bg-gradient-soft text-white shadow-soft"
                : "text-accent/70 hover:text-accent"
            }`}
          >
            {LOCALE_LABELS[l]}
          </button>
        );
      })}
    </div>
  );
}
