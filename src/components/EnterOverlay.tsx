"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
 * How long to wait after the tap for the first clip to produce a frame before
 * giving up on the intro. Pages can serve this site slowly enough that the
 * clips are still buffering when someone taps, and a guest who taps and gets
 * nothing will assume the invitation is broken.
 */
const STALL_GRACE = 2500;

/** Length of the overlay's own fade, and the fallback that completes it. */
const FADE_MS = 2000;

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
  /**
   * False until the client has hydrated. The markup is server-rendered, so
   * without this the invitation shows "Tap to open" while nothing is listening
   * yet — over a slow connection that is seconds of tapping with no response,
   * which reads as broken.
   */
  const [interactive, setInteractive] = useState(false);
  /** The poster hides once the first clip has a frame of its own to show. */
  const [envelopeVisible, setEnvelopeVisible] = useState(false);
  const [brightened, setBrightened] = useState(false);
  const [bridgeVisible, setBridgeVisible] = useState(false);

  const envelopeRef = useRef<HTMLVideoElement>(null);
  const bridgeRef = useRef<HTMLVideoElement>(null);
  const bridgeStarted = useRef(false);
  const heroTextShown = useRef(false);
  const entered = useRef(false);
  const stallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStallTimer = () => {
    if (stallTimer.current) {
      clearTimeout(stallTimer.current);
      stallTimer.current = null;
    }
  };

  useEffect(() => setInteractive(true), []);

  const showHeroText = useCallback(() => {
    if (heroTextShown.current) return;
    heroTextShown.current = true;
    onShowHeroText();
  }, [onShowHeroText]);

  const finish = useCallback(() => {
    if (entered.current) return;
    entered.current = true;
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    setPhase("done");
    onEnter();
  }, [onEnter]);

  const beginFade = useCallback(() => {
    clearStallTimer();
    showHeroText();
    setPhase((p) => {
      if (p !== "playing") return p;
      // `transitionend` is the fast path, but it does not always arrive — it
      // is skipped when the element is not rendered, when the transition is
      // interrupted, and (observed on the deployed site) sometimes for no
      // visible reason. The timer guarantees the overlay always goes away.
      if (!fadeTimer.current) {
        fadeTimer.current = setTimeout(finish, FADE_MS + 150);
      }
      return "fading";
    });
  }, [showHeroText, finish]);

  /** Hand over to the second clip; if it will not play, just fade out. */
  const startBridge = useCallback(() => {
    if (bridgeStarted.current) return;
    bridgeStarted.current = true;
    setBridgeVisible(true);
    bridgeRef.current?.play().catch(() => beginFade());
  }, [beginFade]);

  const start = () => {
    if (phase !== "idle" || !interactive) return;
    setPhase("playing");
    onStartMusic();

    // The clips are small, but GitHub Pages can be slow enough that they are
    // still buffering when someone taps. Rather than leaving them staring at
    // the poster, give the first clip a moment to produce a frame and
    // otherwise go straight to the invitation.
    clearStallTimer();
    stallTimer.current = setTimeout(() => {
      const v = envelopeRef.current;
      if (!v || v.currentTime < 0.05) beginFade();
    }, STALL_GRACE);

    envelopeRef.current?.play().catch(() => {
      // Some browsers still refuse; skip straight to the invitation.
      startBridge();
    });
  };

  /** First clip: reveal it once playing, warm it near the end, then hand over. */
  const onEnvelopeTime = () => {
    const v = envelopeRef.current;
    if (!v) return;
    if (v.currentTime > 0.05 && !envelopeVisible) {
      clearStallTimer();
      setEnvelopeVisible(true);
    }
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

  /**
   * Only our own opacity fade ends the intro. `transitionend` bubbles, and the
   * children have their own fades — the second clip's 800ms fade-in was
   * unmounting the overlay less than a second in, cutting the 2s fade short.
   */
  const handleFadeEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== "opacity") return;
    if (phase !== "fading") return;
    finish();
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
      style={{ transitionDuration: `${FADE_MS}ms` }}
      className={`fixed inset-0 z-50 bg-background transition-opacity ease-in-out ${
        leaving
          ? "pointer-events-none opacity-0"
          : `opacity-100 ${interactive ? "cursor-pointer" : "cursor-default"}`
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

      {phase === "idle" && interactive && (
        <span className="absolute bottom-10 left-0 right-0 z-10 text-center text-[10px] uppercase tracking-[0.32em] text-foreground/80 animate-pulse drop-shadow-[0_1px_3px_rgba(255,255,255,0.6)]">
          Tap to open
        </span>
      )}
    </div>
  );
}
