export type Locale = "en" | "ru";

export const LOCALES: Locale[] = ["ru", "en"];
export const DEFAULT_LOCALE: Locale = "ru";

/** localStorage key for the persisted language choice. */
export const LOCALE_KEY = "cycle-tracker:locale";

/** Short labels used inside the switcher pill. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
};

/** Full native language names. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
};

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ru";
}
