"use client";

import { useEffect, useState } from "react";
import { startOfDay } from "date-fns";
import { useCycleData } from "@/hooks/useCycleData";
import {
  averageCycleLength,
  averagePeriodLength,
  deriveCycles,
  predictNextPeriods,
} from "@/lib/cycle";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import type { SyncState } from "@/hooks/useCycleData";

export default function InsightsPage() {
  const { data, ready, reset, sync } = useCycleData();
  const { t, formatDays, formatCycles, formatDate } = useI18n();
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(startOfDay(new Date())), []);

  if (!ready || !today) {
    return <div className="h-64 animate-pulse rounded-xl2 bg-white/50" />;
  }

  const cycles = deriveCycles(data);
  const lengths = cycles.map((c) => c.length);
  const avgCycle = averageCycleLength(data);
  const avgPeriod = averagePeriodLength(data);
  const shortest = lengths.length ? Math.min(...lengths) : null;
  const longest = lengths.length ? Math.max(...lengths) : null;
  const variation =
    shortest !== null && longest !== null ? longest - shortest : null;
  const regularity =
    variation === null
      ? "—"
      : variation <= 3
        ? t("insights.veryRegular")
        : variation <= 7
          ? t("insights.fairlyRegular")
          : t("insights.irregular");

  const upcoming = predictNextPeriods(data, 3, today);
  const daysUnit = t("insights.daysUnit");

  return (
    <div className="flex flex-col gap-5">
      <header className="px-1">
        <h1 className="text-2xl font-bold text-[#5b4a61]">{t("insights.title")}</h1>
        <p className="mt-0.5 text-sm text-[#8a7a90]">{t("insights.subtitle")}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t("insights.avgCycle")} value={`${avgCycle}`} unit={daysUnit} />
        <StatCard label={t("insights.avgPeriod")} value={`${avgPeriod}`} unit={daysUnit} />
        <StatCard
          label={t("insights.shortest")}
          value={shortest !== null ? `${shortest}` : "—"}
          unit={shortest !== null ? daysUnit : ""}
        />
        <StatCard
          label={t("insights.longest")}
          value={longest !== null ? `${longest}` : "—"}
          unit={longest !== null ? daysUnit : ""}
        />
      </div>

      <section className="rounded-xl2 border border-white/70 bg-white/80 p-5 shadow-card backdrop-blur-sm">
        <p className="text-sm text-[#8a7a90]">{t("insights.regularity")}</p>
        <p className="mt-1 text-xl font-bold text-accent">{regularity}</p>
        {variation !== null && (
          <p className="mt-0.5 text-sm text-[#8a7a90]">
            {t("insights.spread", { days: formatDays(variation) })}
          </p>
        )}
        <p className="mt-1 text-xs text-[#b0a0b6]">
          {t("insights.basedOnCompleted", { cycles: formatCycles(cycles.length) })}
        </p>
      </section>

      {upcoming.length > 0 && (
        <section className="rounded-xl2 border border-white/70 bg-white/80 p-5 shadow-card backdrop-blur-sm">
          <p className="mb-2 text-sm font-semibold text-[#5b4a61]">
            {t("insights.upcoming")}
          </p>
          <ul className="flex flex-col gap-2">
            {upcoming.map((d, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-2xl bg-canvas px-4 py-2.5"
              >
                <span className="text-sm capitalize text-[#6b5a70]">
                  {formatDate(d, "EEEE, d MMM")}
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-period" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <SettingsSection sync={sync} />

      <DangerZone onReset={reset} hasData={data.periods.length > 0} />

      <p className="px-2 text-center text-[11px] text-[#b0a0b6]">
        {t("insights.privacy")}
      </p>
    </div>
  );
}

function SettingsSection({ sync }: { sync: SyncState }) {
  const { t } = useI18n();
  const { user, signOut } = useAuth();

  return (
    <section className="rounded-xl2 border border-white/70 bg-white/80 p-5 shadow-card backdrop-blur-sm">
      <p className="mb-3 text-sm font-semibold text-[#5b4a61]">
        {t("settings.title")}
      </p>

      {user?.email && (
        <div className="mb-3">
          <p className="text-xs text-[#8a7a90]">{t("settings.signedInAs")}</p>
          <p className="mt-0.5 break-all text-sm font-medium text-[#5b4a61]">
            {user.email}
          </p>
        </div>
      )}

      <SyncBadge sync={sync} />

      <button
        onClick={() => signOut()}
        className="mt-3 w-full rounded-2xl bg-canvas py-2.5 text-sm font-medium text-[#6b5a70] transition-colors hover:bg-pms"
      >
        {t("auth.signOut")}
      </button>
    </section>
  );
}

function SyncBadge({ sync }: { sync: SyncState }) {
  const { t } = useI18n();
  const map: Record<SyncState, { label: string; dot: string; text: string }> = {
    idle: { label: t("sync.synced"), dot: "bg-emerald-400", text: "text-[#8a7a90]" },
    syncing: { label: t("sync.syncing"), dot: "bg-accent animate-pulse", text: "text-accent" },
    error: { label: t("sync.error"), dot: "bg-[#e0a0a0]", text: "text-[#c06a93]" },
  };
  const s = map[sync];
  return (
    <span className={`flex items-center gap-2 text-xs ${s.text}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl2 border border-white/70 bg-white/80 p-4 shadow-card backdrop-blur-sm">
      <p className="text-xs text-[#8a7a90]">{label}</p>
      <p className="mt-1 text-3xl font-bold text-accent">
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-[#a899ae]">{unit}</span>}
      </p>
    </div>
  );
}

function DangerZone({
  onReset,
  hasData,
}: {
  onReset: () => void;
  hasData: boolean;
}) {
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);
  if (!hasData) return null;

  return (
    <section className="rounded-xl2 border border-primary/30 bg-white/60 p-4">
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="w-full rounded-2xl py-2.5 text-sm font-medium text-[#c06a93] transition-colors hover:bg-pms"
        >
          {t("insights.clearData")}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-center text-sm text-[#6b5a70]">
            {t("insights.confirmClear")}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-2xl bg-canvas py-2.5 text-sm font-medium text-[#6b5a70]"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={() => {
                onReset();
                setConfirming(false);
              }}
              className="flex-1 rounded-2xl bg-gradient-soft py-2.5 text-sm font-semibold text-white shadow-soft"
            >
              {t("common.delete")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
