import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
} from "date-fns";
import { CycleData, DayKind, DerivedCycle, PeriodEntry } from "./types";

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;
export const FERTILE_START_DAY = 10; // inclusive (1-indexed cycle day)
export const FERTILE_END_DAY = 17; // inclusive
export const OVULATION_DAY = 14;
export const PMS_WINDOW = 5; // days before the next predicted period
export const HISTORY_WINDOW = 6; // cycles averaged for predictions

/** Format a Date as the canonical "yyyy-MM-dd" storage key. */
export function toKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Parse a "yyyy-MM-dd" key back into a local Date. */
export function fromKey(key: string): Date {
  return parseISO(key);
}

/* -------------------------------------------------------------------------- */
/* Period day set <-> ranges                                                  */
/* -------------------------------------------------------------------------- */

/** Expand all period ranges into a flat set of "yyyy-MM-dd" day keys. */
export function periodDaySet(periods: PeriodEntry[]): Set<string> {
  const set = new Set<string>();
  for (const p of periods) {
    const start = fromKey(p.start);
    const end = p.end ? fromKey(p.end) : start;
    const span = Math.max(0, differenceInCalendarDays(end, start));
    for (let i = 0; i <= span; i++) set.add(toKey(addDays(start, i)));
  }
  return set;
}

/** Coalesce a set of day keys into sorted, contiguous period ranges. */
export function daysToPeriods(days: Set<string>): PeriodEntry[] {
  const sorted = Array.from(days).sort();
  const periods: PeriodEntry[] = [];
  let runStart: string | null = null;
  let prev: string | null = null;

  for (const day of sorted) {
    if (runStart === null) {
      runStart = day;
    } else if (prev && differenceInCalendarDays(fromKey(day), fromKey(prev)) > 1) {
      periods.push({ start: runStart, end: prev });
      runStart = day;
    }
    prev = day;
  }
  if (runStart !== null && prev !== null) {
    periods.push({ start: runStart, end: prev });
  }
  return periods;
}

/** Toggle a single calendar day on/off, re-coalescing ranges afterwards. */
export function toggleDay(data: CycleData, day: Date): CycleData {
  const key = toKey(day);
  const set = periodDaySet(data.periods);
  if (set.has(key)) set.delete(key);
  else set.add(key);
  return { ...data, periods: daysToPeriods(set) };
}

/* -------------------------------------------------------------------------- */
/* Derived statistics                                                         */
/* -------------------------------------------------------------------------- */

/** Sorted (oldest -> newest) list of period start dates. */
export function sortedStarts(periods: PeriodEntry[]): string[] {
  return periods.map((p) => p.start).sort();
}

/**
 * Build completed cycles from consecutive period starts. A cycle runs from one
 * period start to the day before the next period start.
 */
export function deriveCycles(data: CycleData): DerivedCycle[] {
  const periods = [...data.periods].sort((a, b) => a.start.localeCompare(b.start));
  const cycles: DerivedCycle[] = [];

  for (let i = 0; i < periods.length - 1; i++) {
    const start = periods[i].start;
    const nextStart = periods[i + 1].start;
    const length = differenceInCalendarDays(fromKey(nextStart), fromKey(start));
    if (length <= 0) continue; // guard against bad data
    const end = toKey(addDays(fromKey(nextStart), -1));
    const periodEnd = periods[i].end ?? periods[i].start;
    const periodLength =
      differenceInCalendarDays(fromKey(periodEnd), fromKey(start)) + 1;
    cycles.push({ start, end, length, periodLength });
  }
  return cycles;
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Average cycle length from recent history (or manual override / default). */
export function averageCycleLength(data: CycleData): number {
  if (data.manualCycleLength && data.manualCycleLength > 0) {
    return data.manualCycleLength;
  }
  const cycles = deriveCycles(data).slice(-HISTORY_WINDOW);
  const avg = average(cycles.map((c) => c.length));
  return avg ? Math.round(avg) : DEFAULT_CYCLE_LENGTH;
}

/** Average bleeding length from recent history (or default). */
export function averagePeriodLength(data: CycleData): number {
  const cycles = deriveCycles(data).slice(-HISTORY_WINDOW);
  const avg = average(cycles.map((c) => c.periodLength));
  if (avg) return Math.round(avg);

  // Fall back to the most recent logged period's length, else the default.
  const last = [...data.periods].sort((a, b) => a.start.localeCompare(b.start)).pop();
  if (last) {
    const end = last.end ?? last.start;
    return differenceInCalendarDays(fromKey(end), fromKey(last.start)) + 1;
  }
  return DEFAULT_PERIOD_LENGTH;
}

/** The most recent period start, or null if nothing is logged. */
export function lastPeriodStart(data: CycleData): Date | null {
  const starts = sortedStarts(data.periods);
  const last = starts[starts.length - 1];
  return last ? fromKey(last) : null;
}

/** Current cycle day (1-indexed), or null when there's no data. */
export function currentCycleDay(data: CycleData, today = new Date()): number | null {
  const last = lastPeriodStart(data);
  if (!last) return null;
  return differenceInCalendarDays(today, last) + 1;
}

/** Predicted upcoming period start dates (count defaults to 3). */
export function predictNextPeriods(
  data: CycleData,
  count = 3,
  today = new Date()
): Date[] {
  const last = lastPeriodStart(data);
  if (!last) return [];
  const cycleLen = averageCycleLength(data);

  // Roll forward until the next start is in the future, then emit `count`.
  let next = addDays(last, cycleLen);
  while (differenceInCalendarDays(next, today) < 0) {
    next = addDays(next, cycleLen);
  }
  const out: Date[] = [];
  for (let i = 0; i < count; i++) {
    out.push(addDays(next, i * cycleLen));
  }
  return out;
}

/** Days until the next predicted period (negative = overdue), or null. */
export function daysUntilNextPeriod(
  data: CycleData,
  today = new Date()
): number | null {
  const [next] = predictNextPeriods(data, 1, today);
  if (!next) return null;
  return differenceInCalendarDays(next, today);
}

/* -------------------------------------------------------------------------- */
/* Per-day classification (for calendar colouring)                            */
/* -------------------------------------------------------------------------- */

/**
 * All cycle "anchors" — the start dates that begin a cycle. Combines logged
 * period starts with predicted future starts so colouring extends ahead.
 */
export function cycleAnchorsForRender(data: CycleData, today: Date): Date[] {
  const logged = sortedStarts(data.periods).map(fromKey);
  const predicted = predictNextPeriods(data, HISTORY_WINDOW, today);
  return [...logged, ...predicted].sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Classify a single calendar day for visual styling. `today` is injected for
 * deterministic rendering.
 */
export function classifyDay(
  day: Date,
  data: CycleData,
  today = new Date(),
  precomputed?: { periodDays: Set<string>; anchors: Date[] }
): DayKind {
  const periodDays = precomputed?.periodDays ?? periodDaySet(data.periods);
  const key = toKey(day);

  // Actual logged bleeding always wins.
  if (periodDays.has(key)) return "period";

  if (data.periods.length === 0) return "normal";

  const anchors = precomputed?.anchors ?? cycleAnchorsForRender(data, today);
  if (anchors.length === 0) return "normal";

  // Find the anchor that begins the cycle this day belongs to.
  let anchor: Date | null = null;
  for (const a of anchors) {
    if (differenceInCalendarDays(day, a) >= 0) anchor = a;
    else break;
  }
  if (!anchor) return "normal";

  const cycleLen = averageCycleLength(data);
  const periodLen = averagePeriodLength(data);
  const cycleDay = differenceInCalendarDays(day, anchor) + 1; // 1-indexed

  // Beyond one full predicted cycle from its anchor -> leave to the next anchor.
  if (cycleDay > cycleLen) return "normal";

  const isPredictedAnchor = day > today || anchor > today;

  // Predicted bleeding for a future, not-yet-logged cycle.
  if (isPredictedAnchor && cycleDay <= periodLen) return "predicted-period";

  if (cycleDay === OVULATION_DAY) return "ovulation";
  if (cycleDay >= FERTILE_START_DAY && cycleDay <= FERTILE_END_DAY) return "fertile";
  if (cycleDay >= cycleLen - (PMS_WINDOW - 1)) return "pms";

  return "normal";
}
