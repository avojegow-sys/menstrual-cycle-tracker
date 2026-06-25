/** A single logged period (a contiguous run of bleeding days). */
export interface PeriodEntry {
  /** Period start date, stored as an ISO date string: "yyyy-MM-dd". */
  start: string;
  /** Period end date (inclusive), "yyyy-MM-dd". Null while still ongoing. */
  end: string | null;
}

/** The full persisted app state. */
export interface CycleData {
  /** Schema version, to allow safe migrations later. */
  version: 1;
  /** Logged periods, newest last. */
  periods: PeriodEntry[];
  /** Optional manual override for the average cycle length. */
  manualCycleLength?: number | null;
}

/** A derived, completed cycle (start of one period -> day before the next). */
export interface DerivedCycle {
  /** "yyyy-MM-dd" — first day of this cycle. */
  start: string;
  /** "yyyy-MM-dd" — last day of this cycle (day before next period). */
  end: string;
  /** Total length of the cycle in days. */
  length: number;
  /** Length of the period (bleeding) within this cycle, in days. */
  periodLength: number;
}

/** Visual classification for a calendar day. */
export type DayKind =
  | "period"
  | "predicted-period"
  | "fertile"
  | "ovulation"
  | "pms"
  | "normal";
