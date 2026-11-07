"use client";

import { useState } from "react";

import { ART, COUPLE, EVENT } from "@/data/wedding";

type EnterOverlayProps = {
  /** Fired on the tap that opens the invitation. */
  onEnter: () => void;
};

type Phase = "sealed" | "opening" | "leaving" | "gone";

/** Beat timings, in ms from the tap. */
const FLAP_AT = 220; // the flap starts lifting just after the seal
const LEAVE_AT = 900; // the card begins pulling away
const DONE_AT = 2500; // everything is off-screen

/**
 * The opening animation. The invitation arrives as a sealed envelope; tapping
 * lifts the wax seal, opens the flap, and draws the card away to reveal the
 * hero beneath.
 *
 * The original played two MP4s here (34MB) whose wax seal carries the template
 * couple's monogram, so this rebuilds the same beat from the re-lettered seal
 * and the two envelope stills instead.
 *
 * It also earns its keep: browsers refuse `audio.play()` without a gesture, so
 * the page needs a tap before the music can start.
 */
export function EnterOverlay({ onEnter }: EnterOverlayProps) {
  const [phase, setPhase] = useState<Phase>("sealed");

  const open = () => {
    if (phase !== "sealed") return;
    setPhase("opening");
    onEnter();
    setTimeout(() => setPhase("leaving"), LEAVE_AT);
    setTimeout(() => setPhase("gone"), DONE_AT);
  };

  if (phase === "gone") return null;

  const opening = phase !== "sealed";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Open the invitation"
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className={`fixed inset-0 z-50 overflow-hidden bg-background ${
        opening ? "pointer-events-none" : "cursor-pointer"
      }`}
      style={
        phase === "leaving"
          ? {
              animation: "introLeave 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            }
          : undefined
      }
    >
      {/* Embossed panel behind everything. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ART.heroFrame}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover select-none"
        draggable={false}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="relative w-[min(78vw,340px)] aspect-square">
          {/* Closed flap, fading out as the envelope opens. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ART.envelopeClosed}
            alt=""
            aria-hidden
            draggable={false}
            className={`absolute inset-0 h-full w-full object-contain object-bottom transition-opacity duration-700 ${
              opening ? "opacity-0" : "opacity-100"
            }`}
            style={opening ? { transitionDelay: `${FLAP_AT}ms` } : undefined}
          />
          {/* Opened flap underneath, fading in on the same beat. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ART.envelopeOpen}
            alt=""
            aria-hidden
            draggable={false}
            className={`absolute inset-0 h-full w-full object-contain object-bottom transition-opacity duration-700 ${
              opening ? "opacity-100" : "opacity-0"
            }`}
            style={opening ? { transitionDelay: `${FLAP_AT}ms` } : undefined}
          />

          {/* Light travelling across the envelope while it waits. */}
          {!opening && (
            <span
              aria-hidden
              className="intro-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-md"
              style={{ animation: "introSheen 5.5s ease-in-out infinite 1.2s" }}
            />
          )}

          {/* The wax seal, breathing until it is lifted away. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ART.footerSeal}
            alt=""
            aria-hidden
            draggable={false}
            className="intro-seal absolute left-1/2 top-1/2 w-[34%] h-auto -translate-x-1/2 -translate-y-1/2 select-none drop-shadow-[0_3px_8px_rgba(0,0,0,0.18)]"
            style={{
              animation: opening
                ? "sealLift 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards"
                : "sealBreathe 3.4s ease-in-out infinite",
            }}
          />
        </div>

        <div
          className="mt-10 flex flex-col items-center"
          style={
            opening
              ? { animation: "introLabel 0.5s ease-out forwards" }
              : undefined
          }
        >
          <p className="font-doulaise text-4xl md:text-5xl leading-none text-foreground">
            {COUPLE.one.first} &amp; {COUPLE.two.first}
          </p>
          <p className="mt-4 font-display text-[11px] md:text-xs uppercase tracking-[0.3em] text-foreground/70">
            {EVENT.dateDotted}
          </p>
          <span className="intro-label mt-8 block animate-pulse text-[10px] uppercase tracking-[0.32em] text-foreground/70">
            Tap to open
          </span>
        </div>
      </div>
    </div>
  );
}
