import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True only when both env vars are present (set in .env.local / Vercel). */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * The shared browser Supabase client, or `null` when env vars are missing
 * (e.g. before the user has created their project). Callers must check
 * `isSupabaseConfigured` / null before use.
 *
 * Auth options:
 * - persistSession: keep the session in localStorage so the user stays logged
 *   in permanently on this device.
 * - autoRefreshToken: silently refresh so they never get logged out.
 * - detectSessionInUrl: pick up the magic-link tokens on redirect back.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "cycle-tracker:auth",
      },
    })
  : null;

/** Narrowing helper for code paths that require a configured client. */
export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
}

/** Shape of a row in the `cycles` table. */
export interface CycleRow {
  id: string;
  user_id: string;
  start_date: string; // yyyy-MM-dd
  end_date: string | null; // yyyy-MM-dd
  notes: string | null;
  symptoms: unknown | null;
  created_at: string;
}
