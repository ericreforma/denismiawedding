"use client";

import { useEffect, useState } from "react";

import { Portal } from "./Portal";
import { Reveal } from "./Reveal";
import { DRESS_BOARDS } from "@/data/wedding";

/**
 * The couple's dress-code boards, shown whole and openable full screen.
 *
 * The enlarge step is not decoration: the role labels on these graphics are
 * only a few pixels tall once the board is fitted to a phone, and a dress code
 * nobody can read does not do its job.
 */
export function DressBoards() {
  const [open, setOpen] = useState<number | null>(null);
  const board = open === null ? null : DRESS_BOARDS[open];

  // Close on Escape, and stop the page scrolling behind the overlay.
  useEffect(() => {
    if (board === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [board]);

  return (
    <>
      {/* Rendered inside the dress-code section rather than as a section of
          its own — these are the dress code, not a separate topic. */}
      <div className="mt-16 md:mt-20">
        <div className="mx-auto max-w-3xl space-y-12 md:space-y-16">
          {DRESS_BOARDS.map((b, i) => (
            <Reveal key={b.src} shift={24} delayMs={i * 90}>
              <figure className="text-center">
                <figcaption className="mb-5 font-display text-[11px] md:text-xs uppercase tracking-[0.3em] text-foreground/70">
                  {b.label}
                </figcaption>

                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`Enlarge the dress code ${b.label.toLowerCase()}`}
                  className="group block w-full cursor-zoom-in"
                >
                  <span className="relative block border border-foreground/25 p-[3px] transition-colors duration-500 group-hover:border-foreground/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.src}
                      alt={b.alt}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="block w-full h-auto select-none shadow-[0_10px_30px_-18px_hsl(var(--foreground)/0.5)]"
                    />
                  </span>
                  <span className="mt-3 block text-[10px] uppercase tracking-[0.3em] text-foreground/50">
                    Tap to enlarge
                  </span>
                </button>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>

      {board && (
        <Portal>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={board.label}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 overflow-auto overscroll-contain bg-foreground/95 p-4 cursor-zoom-out animate-[fadeUp_0.25s_ease-out_both]"
          >
            <div className="flex min-h-full min-w-full items-center justify-center">
              {/* Sized by height on small screens so a landscape board becomes
                wider than the phone and the labels are actually legible; the
                wrapper scrolls sideways. Fitted whole from md up, where there
                is room for it. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={board.src}
                alt={board.alt}
                onClick={(e) => e.stopPropagation()}
                className="h-[82vh] w-auto max-w-none object-contain md:h-auto md:max-h-[88vh] md:max-w-full"
                draggable={false}
              />
            </div>

            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="fixed top-5 right-5 grid h-10 w-10 place-items-center rounded-full border border-background/40 bg-foreground/60 text-background text-xl leading-none backdrop-blur-sm transition-colors hover:bg-background/15"
            >
              &times;
            </button>

            <span className="pointer-events-none fixed bottom-5 left-0 right-0 text-center text-[10px] uppercase tracking-[0.3em] text-background/60 md:hidden">
              Drag to pan · tap to close
            </span>
          </div>
        </Portal>
      )}
    </>
  );
}
