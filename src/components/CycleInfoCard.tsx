"use client";

import { CycleData } from "@/lib/types";
import {
  averageCycleLength,
  currentCycleDay,
  daysUntilNextPeriod,
  predictNextPeriods,
} from "@/lib/cycle";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface Props {
  data: CycleData;
  today: Date;
}

export default function CycleInfoCard({ data, today }: Props) {
  const { t, formatDays, formatDate } = useI18n();
  const hasData = data.periods.length > 0;
  const cycleDay = currentCycleDay(data, today);
  const avg = averageCycleLength(data);
  const until = daysUntilNextPeriod(data, today);
  const [nextStart] = predictNextPeriods(data, 1, today);

  if (!hasData) {
    return (
      <section className="rounded-xl2 bg-gradient-soft p-6 text-white shadow-card">
        <h1 className="text-lg font-semibold">{t("cycle.welcomeTitle")}</h1>
        <p className="mt-1 text-sm text-white/90">{t("cycle.welcomeBody")}</p>
      </section>
    );
  }

  const isLate = until !== null && until < 0;
  const countdownLabel =
    until === null
      ? "—"
      : until === 0
        ? t("cycle.today")
        : until > 0
          ? formatDays(until)
          : t("cycle.late", { days: formatDays(Math.abs(until)) });

  return (
    <section className="rounded-xl2 bg-gradient-soft p-6 text-white shadow-card">
      <p className="text-sm font-medium text-white/80">{t("cycle.today")}</p>
      <div className="mt-1 flex items-end justify-between">
        <div>
          <p className="text-4xl font-bold leading-none">
            {cycleDay !== null ? t("cycle.dayN", { n: cycleDay }) : "—"}
          </p>
          <p className="mt-1 text-sm text-white/80">{t("cycle.ofYourCycle")}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold leading-none">{countdownLabel}</p>
          <p className="mt-1 text-sm text-white/80">
            {isLate ? t("cycle.periodWord") : t("cycle.untilNextPeriod")}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Stat label={t("cycle.avgCycle")} value={formatDays(avg)} />
        <Stat
          label={t("cycle.nextPeriod")}
          value={nextStart ? formatDate(nextStart, "d MMM") : "—"}
        />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
      <p className="text-white/75">{label}</p>
      <p className="mt-0.5 text-base font-semibold">{value}</p>
    </div>
  );
}
