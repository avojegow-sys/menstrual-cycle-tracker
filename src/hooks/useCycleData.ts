"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CycleData } from "@/lib/types";
import { EMPTY_DATA, STORAGE_KEY, loadData, saveData } from "@/lib/storage";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  deleteAllPeriods,
  fetchPeriods,
  pushPeriods,
} from "@/lib/repository";

export type SyncState = "idle" | "syncing" | "error";

interface UseCycleData {
  /** Current state. */
  data: CycleData;
  /** False until the initial load (cache + cloud) has settled. */
  ready: boolean;
  /** Cloud sync status for the most recent write. */
  sync: SyncState;
  /** Apply an updater (like setState), persist locally, and sync to the cloud. */
  update: (updater: (prev: CycleData) => CycleData) => void;
  /** Wipe all data locally and in the cloud. */
  reset: () => void;
}

/**
 * Source of truth is Supabase (per-user `cycles` rows). localStorage is used
 * as an offline render cache so the UI is instant and survives brief offline
 * use; every change is applied optimistically and then synced to the cloud.
 */
export function useCycleData(): UseCycleData {
  const { user, status } = useAuth();
  const [data, setData] = useState<CycleData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncState>("idle");

  // Refs let `update` read the latest values without being re-created.
  const dataRef = useRef(data);
  dataRef.current = data;
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = user?.id ?? null;

  // 1) Instant paint from the local cache, and keep tabs in sync.
  useEffect(() => {
    setData(loadData());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setData(loadData());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 2) On login, load the authoritative data from the cloud.
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || !user) {
      setReady(true);
      return;
    }

    let cancelled = false;
    setSync("syncing");
    fetchPeriods(user.id)
      .then((periods) => {
        if (cancelled) return;
        const next: CycleData = {
          version: 1,
          periods,
          manualCycleLength: loadData().manualCycleLength ?? null,
        };
        setData(next);
        saveData(next);
        setSync("idle");
      })
      .catch(() => {
        // Stay on the cached data; flag that the cloud is unreachable.
        if (!cancelled) setSync("error");
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [status, user]);

  const update = useCallback((updater: (prev: CycleData) => CycleData) => {
    const next = updater(dataRef.current);
    dataRef.current = next;
    setData(next); // optimistic
    saveData(next); // offline cache

    const userId = userIdRef.current;
    if (!userId) return;
    setSync("syncing");
    pushPeriods(userId, next.periods)
      .then(() => setSync("idle"))
      .catch(() => setSync("error"));
  }, []);

  const reset = useCallback(() => {
    setData(EMPTY_DATA);
    saveData(EMPTY_DATA);
    dataRef.current = EMPTY_DATA;

    const userId = userIdRef.current;
    if (!userId) return;
    setSync("syncing");
    deleteAllPeriods(userId)
      .then(() => setSync("idle"))
      .catch(() => setSync("error"));
  }, []);

  return { data, ready, sync, update, reset };
}
