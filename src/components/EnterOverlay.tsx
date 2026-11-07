"use client";

import { useCallback, useRef, useState } from "react";

import { INTRO } from "@/data/wedding";

type EnterOverlayProps = {
  /** Fired once the overlay has finished fading, as the hero takes over. */
  onEnter: () => void;
  /** Fired on the tap itself, so the hero text can begin fading in under it. */
  onShowHeroText: () => void;
  /** Fired on the tap — the gesture browsers require before audio can play. */
  onStartMusic: () => void;
};

type Phase = "idle" | "playing" | "fading" | "done";

/**
 * The opening sequence, as the original plays it: a still of the sealed
 * envelope, then on tap two clips back to back — the envelope opening, then
 * the ribboned invitation being unwrapped — before the whole thing fades to
 * the hero.
 *
 * The clips are muted and `playsInline` so mobile will run them inline rather
 * than kicking out to a fullscreen player.
 */
export function EnterOverlay({
  onEnter,
  onShowHeroText,
  onStartMusic,
}: EnterOverlayProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  /** The poster hides once the first clip has a frame of its own to show. */
  const [envelopeVisible, setEnvelopeVisible] = useState(false);
  const [brightened, setBrightened] = useState(false);
  const [bridgeVisible, setBridgeVisible] = useState(false);

  const envelopeRef = useRef<HTMLVideoElement>(null);
  const bridgeRef = useRef<HTMLVideoElement>(null);
  const bridgeStarted = useRef(false);
  const heroTextShown = useRef(false);
  const entered = useRef(false);

  const showHeroText = useCallback(() => {
    if (heroTextShown.current) return;
    heroTextShown.current = true;
    onShowHeroText();
  }, [onShowHeroText]);

  const beginFade = useCallback(() => {
    showHeroText();
    setPhase((p) => (p === "playing" ? "fading" : p));
  }, [showHeroText]);

  /** Hand over to the second clip; if it will not play, just fade out. */
  const startBridge = useCallback(() => {
    if (bridgeStarted.current) return;
    bridgeStarted.current = true;
    setBridgeVisible(true);
    bridgeRef.current?.play().catch(() => beginFade());
  }, [beginFade]);

  const start = () => {
    if (phase !== "idle") return;
    setPhase("playing");
    onStartMusic();
    envelopeRef.current?.play().catch(() => {
      // Some browsers still refuse; skip straight to the invitation.
      startBridge();
    });
  };

  /** First clip: reveal it once playing, warm it near the end, then hand over. */
  const onEnvelopeTime = () => {
    const v = envelopeRef.current;
    if (!v) return;
    if (v.currentTime > 0.05 && !envelopeVisible) setEnvelopeVisible(true);
    if (!v.duration) return;
    const left = v.duration - v.currentTime;
    if (left < 1.2 && !brightened) setBrightened(true);
    if (left < 0.1) startBridge();
  };

  /** Second clip: bring the hero text up under the fade, then fade. */
  const onBridgeTime = () => {
    const v = bridgeRef.current;
    if (!v || !v.duration) return;
    const left = v.duration - v.currentTime;
    if (left < 1.8) showHeroText();
    if (left < 1) beginFade();
  };

  const leaving = phase === "fading" || phase === "done";

  const handleFadeEnd = () => {
    if (phase !== "fading" || entered.current) return;
    entered.current = true;
    setPhase("done");
    onEnter();
  };

  if (phase === "done") return null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Open the invitation"
      onClick={start}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          start();
        }
      }}
      onTransitionEnd={handleFadeEnd}
      className={`fixed inset-0 z-50 bg-background transition-opacity duration-[2000ms] ease-in-out ${
        leaving ? "pointer-events-none opacity-0" : "cursor-pointer opacity-100"
      }`}
    >
      {/* Still of the sealed envelope, shown until the first clip has a frame. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={INTRO.poster}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150"
        style={{ opacity: envelopeVisible ? 0 : 1 }}
      />

      <video
        ref={envelopeRef}
        src={INTRO.envelope}
        poster={INTRO.poster}
        onTimeUpdate={onEnvelopeTime}
        onEnded={startBridge}
        playsInline
        muted
        preload="auto"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover ease-in-out"
        style={{
          opacity: envelopeVisible ? 1 : 0,
          filter: brightened ? "brightness(1.1) saturate(0.97)" : "none",
          transition: "opacity 150ms linear, filter 1100ms ease-in-out",
        }}
      />

      <video
        ref={bridgeRef}
        src={INTRO.bridge}
        onTimeUpdate={onBridgeTime}
        onEnded={beginFade}
        playsInline
        muted
        preload="auto"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[800ms] ease-in-out"
        style={{ opacity: bridgeVisible ? 1 : 0 }}
      />

      {phase === "idle" && (
        <span className="absolute bottom-10 left-0 right-0 z-10 text-center text-[10px] uppercase tracking-[0.32em] text-foreground/80 animate-pulse drop-shadow-[0_1px_3px_rgba(255,255,255,0.6)]">
          Tap to open
        </span>
      )}
    </div>
  );
}
