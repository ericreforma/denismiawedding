"use client";

import { useEffect, useRef } from "react";

import { Reveal } from "./Reveal";
import { ART, FILM } from "@/data/wedding";
import { duckTheme, restoreTheme } from "@/hooks/useBackgroundMusic";

const FRAME_ID = "save-the-date-player";

/** Minimal shape of the bits of the IFrame API this file touches. */
type YTPlayerCtor = new (
  el: string | HTMLElement,
  opts: { events: { onStateChange: (e: { data: number }) => void } },
) => unknown;

declare global {
  interface Window {
    YT?: { Player: YTPlayerCtor; PlayerState: Record<string, number> };
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Loads the IFrame API once and resolves when `window.YT` is usable.
 * Held at module scope so a remount reuses the same script and promise.
 */
let apiReady: Promise<void> | null = null;
function loadYouTubeApi() {
  if (apiReady) return apiReady;
  apiReady = new Promise<void>((resolve) => {
    if (window.YT?.Player) return resolve();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  });
  return apiReady;
}

export function SaveTheDate() {
  const wired = useRef(false);

  /**
   * The film has its own soundtrack, so the background theme steps aside
   * while it plays. A plain iframe gives no way to know that is happening,
   * hence the IFrame API: without it a guest hears both at once.
   */
  useEffect(() => {
    if (wired.current) return;
    wired.current = true;
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT?.Player) return;
      const PLAYING = window.YT.PlayerState?.PLAYING ?? 1;
      const PAUSED = window.YT.PlayerState?.PAUSED ?? 2;
      const ENDED = window.YT.PlayerState?.ENDED ?? 0;
      new window.YT.Player(FRAME_ID, {
        events: {
          onStateChange: ({ data }) => {
            if (data === PLAYING) duckTheme();
            else if (data === PAUSED || data === ENDED) restoreTheme();
          },
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Reveal>
      <section
        id="save-the-date"
        className="relative w-full mt-[70px] md:mt-[110px] py-28 md:py-44 px-6 bg-background"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ART.transportBg}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
        />

        <Reveal
          shift={20}
          className="relative z-[1] max-w-[340px] md:max-w-2xl mx-auto"
        >
          {/* The same paper card the transportation note used, washed lighter
              so the type keeps its contrast against the texture. */}
          <div
            className="relative text-center px-5 py-12 md:px-12 md:py-14 shadow-[0_10px_30px_-12px_hsl(var(--foreground)/0.35)]"
            style={{
              backgroundImage: `url(${ART.paper})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-white/45 pointer-events-none"
            />

            {/* Postage stamps, kept from the transportation card — a
                save-the-date is a thing that arrives in the post. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ART.transportStamps}
              alt=""
              aria-hidden
              className="block w-[130px] md:w-[170px] h-auto mx-auto -rotate-6 translate-x-[10px]"
            />

            <h2 className="font-doulaise text-6xl md:text-8xl text-foreground leading-none mt-8">
              {FILM.heading}
            </h2>

            <p className="text-foreground/85 text-[13px] font-helvetica leading-relaxed mt-5">
              {FILM.blurb}
            </p>

            <div className="mt-8 overflow-hidden rounded-lg shadow-[0_6px_20px_-8px_hsl(var(--foreground)/0.45)]">
              <iframe
                id={FRAME_ID}
                src={FILM.embedUrl}
                title={`${FILM.heading} — a film by Denis and Mia Arr`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="block w-full aspect-video border-0 bg-foreground/10"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </Reveal>
  );
}
