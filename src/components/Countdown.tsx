"use client";

import { ART, WEDDING_DATE } from "@/data/wedding";
import { useCountdown } from "@/hooks/useCountdown";

export function Countdown() {
  const { days, hours, minutes, seconds } = useCountdown(WEDDING_DATE);

  const units = [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Minutes" },
    { value: seconds, label: "Seconds" },
  ];

  return (
    <section id="countdown" className="relative w-full overflow-hidden">
      {/* The frame art fixes the aspect ratio; the numbers are placed on it
          by percentage so they stay registered at every width. */}
      <div className="relative w-full aspect-[1920/1126]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          loading="lazy"
          decoding="async"
          src={ART.countdownFrame}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />

        <h2 className="absolute left-0 right-0 top-[9%] text-center font-display text-[7vw] md:text-6xl leading-none text-[var(--frame-ink)]">
          Countdown
        </h2>

        <div className="absolute left-[17%] right-[17%] top-[33%] bottom-[34%] grid grid-cols-4 items-center">
          {units.map((unit) => (
            <div key={unit.label} className="flex min-w-0 flex-col items-center">
              <span className="font-display text-[6.5vw] md:text-6xl text-foreground leading-none tabular-nums">
                {String(unit.value).padStart(2, "0")}
              </span>
              <span className="mt-1 md:mt-3 text-[2vw] md:text-xs uppercase tracking-[0.15em] text-foreground font-body">
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        <p className="absolute left-0 right-0 bottom-[7%] text-center font-doulaise text-[8vw] md:text-6xl leading-none text-[var(--frame-ink)]">
          See you soon!
        </p>
      </div>
    </section>
  );
}
