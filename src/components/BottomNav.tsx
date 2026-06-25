"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

const tabs: {
  href: string;
  labelKey: TranslationKey;
  icon: () => JSX.Element;
}[] = [
  { href: "/", labelKey: "nav.calendar", icon: CalendarIcon },
  { href: "/history", labelKey: "nav.history", icon: HistoryIcon },
  { href: "/insights", labelKey: "nav.insights", icon: InsightsIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20">
      <div className="mx-auto max-w-md px-4 pb-3">
        <div className="flex items-center justify-around rounded-xl2 border border-white/60 bg-white/80 px-2 py-2 shadow-card backdrop-blur-md">
          {tabs.map(({ href, labelKey, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    active
                      ? "bg-gradient-soft text-white shadow-soft"
                      : "text-accent/70"
                  }`}
                >
                  <Icon />
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    active ? "text-accent" : "text-accent/60"
                  }`}
                >
                  {t(labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3v5h5M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19V5M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 15l3-4 3 2 4-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
