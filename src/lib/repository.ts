import { PeriodEntry } from "./types";
import { CycleRow, getSupabase } from "./supabase";

/**
 * The app models cycle data as a set of coalesced period ranges
 * (`PeriodEntry`). Each range maps 1:1 to a row in the `cycles` table, keyed
 * naturally by (user_id, start_date) — ranges never overlap after coalescing,
 * so the start date is unique per user.
 */

/** Load all of a user's period ranges, sorted oldest -> newest. */
export async function fetchPeriods(userId: string): Promise<PeriodEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("cycles")
    .select("start_date, end_date")
    .eq("user_id", userId)
    .order("start_date", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    start: row.start_date as string,
    end: (row.end_date as string | null) ?? null,
  }));
}

/**
 * Reconcile the cloud rows to match the given period ranges:
 * - insert ranges that don't exist yet,
 * - update ranges whose end date changed,
 * - delete rows whose start date no longer exists.
 *
 * Rows that are unchanged are left untouched (preserving notes / symptoms /
 * created_at). This is safe to call after any local edit.
 */
export async function pushPeriods(
  userId: string,
  periods: PeriodEntry[]
): Promise<void> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("cycles")
    .select("id, start_date, end_date")
    .eq("user_id", userId);
  if (error) throw error;

  const existing = new Map<string, Pick<CycleRow, "id" | "end_date">>();
  for (const row of data ?? []) {
    existing.set(row.start_date as string, {
      id: row.id as string,
      end_date: (row.end_date as string | null) ?? null,
    });
  }

  const desired = new Set(periods.map((p) => p.start));

  const toInsert = periods
    .filter((p) => !existing.has(p.start))
    .map((p) => ({
      user_id: userId,
      start_date: p.start,
      end_date: p.end,
    }));

  const toUpdate = periods.filter((p) => {
    const row = existing.get(p.start);
    return row && (row.end_date ?? null) !== (p.end ?? null);
  });

  const toDeleteIds: string[] = [];
  for (const [start, row] of existing) {
    if (!desired.has(start)) toDeleteIds.push(row.id);
  }

  // Run the three operations. Order doesn't matter (disjoint key sets).
  if (toInsert.length) {
    const { error: insertError } = await supabase
      .from("cycles")
      .insert(toInsert);
    if (insertError) throw insertError;
  }

  await Promise.all(
    toUpdate.map(async (p) => {
      const row = existing.get(p.start)!;
      const { error } = await supabase
        .from("cycles")
        .update({ end_date: p.end })
        .eq("id", row.id);
      if (error) throw error;
    })
  );

  if (toDeleteIds.length) {
    const { error: deleteError } = await supabase
      .from("cycles")
      .delete()
      .in("id", toDeleteIds);
    if (deleteError) throw deleteError;
  }
}

/** Delete every cycle row for a user (used by "Clear all data"). */
export async function deleteAllPeriods(userId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("cycles")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}
