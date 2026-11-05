"use client";

import { Leaf } from "./Leaf";
import { COUPLE, EVENT, IMAGES } from "@/data/wedding";
import { useScrollY } from "@/hooks/useScrollY";

export function Hero() {
  const scrollY = useScrollY();

  return (
    <section
      id="top"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden"
    >
      {/* Parallax backdrop — drifts at 35% of scroll speed, slightly over-scaled
          so the edges never reveal themselves as it moves. */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(0, ${scrollY * 0.35}px, 0) scale(1.08)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMAGES.hero}
          alt={`${COUPLE.groom.first} and ${COUPLE.bride.first} in a sunlit garden`}
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-beige/85" />
      </div>

      <Leaf className="absolute top-6 -left-10 w-56 sm:w-72 opacity-70 animate-drift-slow" />
      <Leaf className="absolute top-10 -right-12 w-56 sm:w-72 opacity-60 animate-drift -scale-x-100" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-sm sm:text-base uppercase tracking-[0.4em] text-white/90 drop-shadow animate-fade-up">
          Together with their families
        </p>

        <h1 className="mt-6 font-script text-[5.5rem] sm:text-[9rem] leading-[0.85] text-white drop-shadow-lg animate-fade-up">
          {COUPLE.groom.first}
          <span className="block font-serif-display text-2xl sm:text-3xl tracking-[0.5em] my-3 sm:my-5 text-white/95">
            &amp;
          </span>
          {COUPLE.bride.first}
          <span className="block font-serif-display text-base sm:text-xl tracking-[0.4em] uppercase mt-6 text-white/95">
            A Garden Wedding
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-white/95 tracking-[0.3em] uppercase drop-shadow animate-fade-up">
          {EVENT.heroLine}
        </p>

        <a
          href="#rsvp"
          className="mt-10 inline-flex items-center justify-center rounded-full bg-sky-deep px-10 py-3.5 text-sm uppercase tracking-[0.3em] text-beige shadow-lg shadow-sky-deep/30 transition hover:scale-105 hover:bg-sky-deep/90"
        >
          RSVP
        </a>
      </div>

      <a
        href="#story"
        aria-label="Scroll to story"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/90 animate-bounce"
      >
        ↓
      </a>
    </section>
  );
}
