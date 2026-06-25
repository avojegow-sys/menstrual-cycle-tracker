"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

const items: { key: TranslationKey; className: string }[] = [
  { key: "legend.period", className: "bg-period" },
  { key: "legend.fertile", className: "bg-fertile border border-accent/30" },
  { key: "legend.ovulation", className: "bg-ovulation" },
  { key: "legend.pms", className: "bg-pms border border-primary/40" },
  {
    key: "legend.predicted",
    className: "border-2 border-dashed border-primary bg-white",
  },
];

export default function Legend() {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] text-[#6b5a70]">
      {items.map((it) => (
        <span key={it.key} className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-3 rounded-full ${it.className}`} />
          {t(it.key)}
        </span>
      ))}
    </div>
  );
}
