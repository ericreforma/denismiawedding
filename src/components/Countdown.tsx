"use client";

import { Leaf } from "./Leaf";
import { WEDDING_DATE } from "@/data/wedding";
import { useCountdown } from "@/hooks/useCountdown";

export function Countdown() {
  const { days, hours, minutes, seconds } = useCountdown(WEDDING_DATE);

  const units = [
    { l: "Days", v: days },
    { l: "Hours", v: hours },
    { l: "Minutes", v: minutes },
    { l: "Seconds", v: seconds },
  ];

  return (
    <section className="relative py-24 px-6">
      <Leaf className="absolute top-8 -left-12 w-48 opacity-40 animate-drift" />
      <Leaf className="absolute bottom-8 -right-12 w-48 opacity-40 animate-drift-slow -scale-x-100" />

      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-sky-deep/70">
          Counting down to
        </p>
        <h2 className="mt-3 font-script text-6xl sm:text-7xl text-clay">
          in bloom
        </h2>

        <div className="mt-10 grid grid-cols-4 gap-3 sm:gap-6">
          {units.map((unit) => (
            <div
              key={unit.l}
              className="rounded-2xl bg-card border border-sky/40 py-5 sm:py-8 shadow-sm"
            >
              <div className="font-serif-display text-3xl sm:text-5xl text-sky-deep tabular-nums">
                {String(unit.v).padStart(2, "0")}
              </div>
              <div className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {unit.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
