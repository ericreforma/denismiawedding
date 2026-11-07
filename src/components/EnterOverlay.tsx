"use client";

import { useState } from "react";

import { ART, COUPLE, EVENT } from "@/data/wedding";

type EnterOverlayProps = {
  /** Fired on the click that dismisses the overlay. */
  onEnter: () => void;
};

/**
 * The click-to-enter screen. It exists mainly so the page has a user gesture
 * to start the music with — browsers refuse `audio.play()` without one.
 * The original ran two video clips here; this keeps the gesture and the fade
 * without the ~20MB of MP4.
 */
export function EnterOverlay({ onEnter }: EnterOverlayProps) {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  const enter = () => {
    if (leaving) return;
    setLeaving(true);
    onEnter();
    // Match the 2s fade before unmounting.
    setTimeout(() => setGone(true), 2000);
  };

  if (gone) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Enter the invitation"
      onClick={enter}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          enter();
        }
      }}
      className={`fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-background transition-opacity duration-[2000ms] ease-in-out ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ART.heroFrame}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover select-none"
        draggable={false}
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ART.footerSeal}
          alt=""
          aria-hidden
          className="mb-10 w-24 md:w-28 h-auto select-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
          draggable={false}
        />

        <p className="font-doulaise text-5xl md:text-7xl leading-none text-foreground">
          {COUPLE.one.first} &amp; {COUPLE.two.first}
        </p>
        <p className="mt-6 font-display text-[11px] md:text-xs uppercase tracking-[0.3em] text-foreground/70">
          {EVENT.dateDotted}
        </p>

        <span className="mt-12 block animate-pulse text-[10px] uppercase tracking-[0.32em] text-foreground/70">
          Tap to open
        </span>
      </div>
    </div>
  );
}
