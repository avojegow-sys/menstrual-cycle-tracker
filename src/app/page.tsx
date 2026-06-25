"use client";

import { useEffect, useState } from "react";
import { startOfDay } from "date-fns";
import Calendar from "@/components/Calendar";
import CycleInfoCard from "@/components/CycleInfoCard";
import Legend from "@/components/Legend";
import { useCycleData } from "@/hooks/useCycleData";
import { toggleDay } from "@/lib/cycle";

export default function CalendarPage() {
  const { data, ready, update } = useCycleData();
  // Resolve "today" on the client only, to avoid SSR/hydration mismatches.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(startOfDay(new Date())), []);

  if (!ready || !today) {
    return <LoadingShell />;
  }

  return (
    <div className="flex flex-col gap-5">
      <CycleInfoCard data={data} today={today} />
      <Calendar
        data={data}
        today={today}
        onToggleDay={(day) => update((prev) => toggleDay(prev, day))}
      />
      <Legend />
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-40 animate-pulse rounded-xl2 bg-white/50" />
      <div className="h-80 animate-pulse rounded-xl2 bg-white/40" />
    </div>
  );
}
