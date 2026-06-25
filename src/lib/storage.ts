import { CycleData } from "./types";

const STORAGE_KEY = "cycle-tracker:data:v1";

export const EMPTY_DATA: CycleData = {
  version: 1,
  periods: [],
  manualCycleLength: null,
};

/** Read the persisted state from localStorage (safe on the server). */
export function loadData(): CycleData {
  if (typeof window === "undefined") return EMPTY_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_DATA;
    const parsed = JSON.parse(raw) as CycleData;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.periods)) {
      return EMPTY_DATA;
    }
    return {
      version: 1,
      periods: parsed.periods,
      manualCycleLength: parsed.manualCycleLength ?? null,
    };
  } catch {
    return EMPTY_DATA;
  }
}

/** Persist the state to localStorage. */
export function saveData(data: CycleData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage may be full or disabled; fail silently — the UI keeps working
    // from in-memory state for the session.
  }
}

export { STORAGE_KEY };
