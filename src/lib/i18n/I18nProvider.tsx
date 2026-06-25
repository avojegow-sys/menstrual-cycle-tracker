"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { format as dfFormat } from "date-fns";
import { ru as ruDateLocale } from "date-fns/locale";
import {
  DEFAULT_LOCALE,
  LOCALE_KEY,
  Locale,
  isLocale,
} from "./config";
import { TranslationKey, WEEKDAYS, dictionaries } from "./translations";

type Params = Record<string, string | number>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Translate a key, interpolating `{name}` placeholders. */
  t: (key: TranslationKey, params?: Params) => string;
  /** "5 days" / "5 дней" with correct pluralization. */
  formatDays: (n: number) => string;
  /** "3 cycles" / "3 цикла" with correct pluralization. */
  formatCycles: (n: number) => string;
  /** Locale-aware date-fns formatting. */
  formatDate: (date: Date, pattern: string) => string;
  /** Short weekday labels, week starting Sunday. */
  weekdays: string[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

/** Russian plural selector: one / few / many. */
function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in params ? String(params[key]) : `{${key}}`
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Read the saved choice on the client after mount (avoids hydration mismatch).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCALE_KEY);
      if (isLocale(saved)) setLocaleState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  // Keep <html lang> in sync for accessibility / SEO.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(LOCALE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale];

    const t = (key: TranslationKey, params?: Params) =>
      interpolate(dict[key] ?? dictionaries.en[key] ?? key, params);

    const formatDays = (n: number) => {
      if (locale === "ru") return `${n} ${pluralRu(n, "день", "дня", "дней")}`;
      return `${n} ${n === 1 ? "day" : "days"}`;
    };

    const formatCycles = (n: number) => {
      if (locale === "ru") return `${n} ${pluralRu(n, "цикл", "цикла", "циклов")}`;
      return `${n} ${n === 1 ? "cycle" : "cycles"}`;
    };

    const formatDate = (date: Date, pattern: string) =>
      dfFormat(date, pattern, {
        locale: locale === "ru" ? ruDateLocale : undefined,
      });

    return {
      locale,
      setLocale,
      t,
      formatDays,
      formatCycles,
      formatDate,
      weekdays: WEEKDAYS[locale],
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}
