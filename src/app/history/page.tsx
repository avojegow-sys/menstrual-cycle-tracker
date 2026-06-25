"use client";

import { useCycleData } from "@/hooks/useCycleData";
import {
  HISTORY_WINDOW,
  averageCycleLength,
  deriveCycles,
  fromKey,
} from "@/lib/cycle";
import { DerivedCycle } from "@/lib/types";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function HistoryPage() {
  const { data, ready } = useCycleData();
  const { t, formatDays, formatCycles } = useI18n();

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-xl2 bg-white/50" />;
  }

  // Newest first for display.
  const cycles = deriveCycles(data).reverse();
  const avg = averageCycleLength(data);

  return (
    <div className="flex flex-col gap-5">
      <header className="px-1">
        <h1 className="text-2xl font-bold text-[#5b4a61]">{t("history.title")}</h1>
        <p className="mt-0.5 text-sm text-[#8a7a90]">{t("history.subtitle")}</p>
      </header>

      <section className="rounded-xl2 bg-gradient-soft p-5 text-white shadow-card">
        <p className="text-sm text-white/80">{t("history.avgCycleLength")}</p>
        <p className="mt-1 text-3xl font-bold">{formatDays(avg)}</p>
        <p className="mt-1 text-sm text-white/80">
          {t("history.basedOn", {
            used: Math.min(cycles.length, HISTORY_WINDOW),
            cycles: formatCycles(cycles.length),
          })}
        </p>
      </section>

      {cycles.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-3">
          {cycles.map((c) => (
            <CycleRow key={c.start} cycle={c} avg={avg} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CycleRow({ cycle, avg }: { cycle: DerivedCycle; avg: number }) {
  const { t, formatDays, formatDate } = useI18n();
  const diff = cycle.length - avg;
  const start = fromKey(cycle.start);
  const end = fromKey(cycle.end);

  return (
    <li className="rounded-xl2 border border-white/70 bg-white/80 p-4 shadow-card backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-[#5b4a61]">
            {formatDate(start, "d MMM")} – {formatDate(end, "d MMM yyyy")}
          </p>
          <p className="mt-0.5 text-sm text-[#8a7a90]">
            {t("history.periodLength", { days: formatDays(cycle.periodLength) })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-accent">{cycle.length}</p>
          <p className="text-[11px] text-[#9a8aa0]">
            {diff === 0
              ? t("history.onAverage")
              : t("history.vsAvg", { sign: diff > 0 ? "+" : "", d: diff })}
          </p>
        </div>
      </div>

      {/* Length bar relative to a 40-day visual max. */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-canvas">
        <div
          className="h-full rounded-full bg-gradient-soft"
          style={{ width: `${Math.min(100, (cycle.length / 40) * 100)}%` }}
        />
      </div>
    </li>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="rounded-xl2 border border-dashed border-primary/40 bg-white/60 p-8 text-center">
      <p className="text-sm text-[#8a7a90]">{t("history.empty")}</p>
    </div>
  );
}
