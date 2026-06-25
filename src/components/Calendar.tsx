"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CycleData, DayKind } from "@/lib/types";
import {
  classifyDay,
  cycleAnchorsForRender,
  periodDaySet,
} from "@/lib/cycle";
import { useI18n } from "@/lib/i18n/I18nProvider";

// Tailwind classes per day classification. `selected` adds the today ring.
const KIND_STYLES: Record<DayKind, string> = {
  period: "bg-period text-white shadow-soft",
  "predicted-period":
    "border-2 border-dashed border-primary text-primary bg-white/60",
  fertile: "bg-fertile text-accent",
  ovulation: "bg-ovulation text-white shadow-soft",
  pms: "bg-pms text-[#a85c86]",
  normal: "text-[#5b4a61] hover:bg-white/70",
};

interface Props {
  data: CycleData;
  today: Date;
  onToggleDay: (day: Date) => void;
}

export default function Calendar({ data, today, onToggleDay }: Props) {
  const { t, formatDate, weekdays } = useI18n();
  const [cursor, setCursor] = useState(() => startOfMonth(today));

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(cursor));
    const gridEnd = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  // Precompute the expensive bits once per render rather than per cell.
  const precomputed = useMemo(
    () => ({
      periodDays: periodDaySet(data.periods),
      anchors: cycleAnchorsForRender(data, today),
    }),
    [data, today]
  );

  return (
    <section className="rounded-xl2 border border-white/70 bg-white/80 p-4 shadow-card backdrop-blur-sm">
      {/* Month header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setCursor((c) => subMonths(c, 1))}
          aria-label={t("calendar.prevMonth")}
          className="flex h-9 w-9 items-center justify-center rounded-full text-accent transition-colors hover:bg-canvas"
        >
          <Chevron dir="left" />
        </button>
        <h2 className="text-base font-semibold capitalize text-[#5b4a61]">
          {formatDate(cursor, "LLLL yyyy")}
        </h2>
        <button
          onClick={() => setCursor((c) => addMonths(c, 1))}
          aria-label={t("calendar.nextMonth")}
          className="flex h-9 w-9 items-center justify-center rounded-full text-accent transition-colors hover:bg-canvas"
        >
          <Chevron dir="right" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-accent/60">
        {weekdays.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, cursor);
          const kind = classifyDay(day, data, today, precomputed);
          const isToday = isSameDay(day, today);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onToggleDay(day)}
              className={`relative flex aspect-square items-center justify-center rounded-full text-sm font-medium transition-all active:scale-90 ${
                KIND_STYLES[kind]
              } ${inMonth ? "" : "opacity-30"} ${
                isToday ? "ring-2 ring-accent ring-offset-2 ring-offset-white" : ""
              }`}
            >
              {format(day, "d")}
              {kind === "ovulation" && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[11px] text-[#9a8aa0]">
        {t("calendar.tapHint")}
      </p>
    </section>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
