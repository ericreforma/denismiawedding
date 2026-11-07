"use client";

import { useEffect, useState } from "react";

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const DAY = 86_400_000;
const HOUR = 3_600_000;
const MINUTE = 60_000;
const SECOND = 1_000;

/**
 * Counts down to `target`. Stays at zero until after mount so the server and
 * client render identical markup, then ticks once a second.
 */
export function useCountdown(target: Date): TimeLeft {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = now === null ? 0 : Math.max(0, target.getTime() - now);

  return {
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / HOUR),
    minutes: Math.floor((diff % HOUR) / MINUTE),
    seconds: Math.floor((diff % MINUTE) / SECOND),
  };
}
