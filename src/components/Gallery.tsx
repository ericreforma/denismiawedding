"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Portal } from "./Portal";
import { Reveal } from "./Reveal";
import { GALLERY, type GalleryPhoto } from "@/data/gallery";

const ROWS = 2;

/** Slow enough to read as drift rather than motion. */
const DRIFT_PX_PER_SECOND = 22;
/** How long the drift waits after someone scrolls or taps. */
const RESUME_AFTER = 2500;

/**
 * Deal the photos into rows of equal height, each row growing sideways.
 *
 * A justified grid normally scales a row to fill a fixed width; here the
 * height is what is fixed and the width is whatever it comes to, because the
 * strip scrolls. Each photo goes to whichever row is currently shortest, so
 * the rows end up near enough the same length — dealt alternately instead,
 * one row runs long whenever the aspect ratios are uneven, and the strip ends
 * with a ragged tail.
 *
 * Widths are measured at height = 1, so the result holds at any row height.
 */
function dealIntoRows(photos: GalleryPhoto[], rows: number) {
  const lanes: { photos: GalleryPhoto[]; width: number }[] = Array.from(
    { length: rows },
    () => ({ photos: [], width: 0 }),
  );
  for (const photo of photos) {
    const shortest = lanes.reduce((a, b) => (b.width < a.width ? b : a));
    shortest.photos.push(photo);
    shortest.width += photo.w / photo.h;
  }
  return lanes.map((l) => l.photos);
}

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  /** Read inside the drift loop, which is set up once and never re-run. */
  const lightboxOpen = useRef(false);
  /** Set by the drift effect so the arrow buttons can hold it off. */
  const pause = useRef<(() => void) | null>(null);

  const lanes = useMemo(() => dealIntoRows(GALLERY, ROWS), []);

  /**
   * The lightbox walks the photographer's own order, not the order the rows
   * happen to deal into. Following the rows would run the whole top row and
   * then start again at the bottom, which makes "next" jump backwards across
   * the strip and the counter mean nothing.
   */
  const indexOf = useCallback(
    (photo: GalleryPhoto) => GALLERY.indexOf(photo),
    [],
  );

  const photo = open === null ? null : GALLERY[open];
  const step = useCallback(
    (by: number) =>
      setOpen((i) =>
        i === null ? i : (i + by + GALLERY.length) % GALLERY.length,
      ),
    [],
  );

  useEffect(() => {
    lightboxOpen.current = photo !== null;
  }, [photo]);

  // Escape closes, arrows move, and the page behind stays put.
  useEffect(() => {
    if (photo === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [photo, step]);

  /**
   * The strip drifts leftward on its own, slowly, and gets out of the way
   * the moment anyone wants to steer.
   *
   * Position is kept in a ref rather than read back from `scrollLeft` each
   * frame: at this speed a frame advances well under a pixel, and a browser
   * that rounds the stored offset would swallow the remainder and leave the
   * strip stuttering or motionless. The accumulator is resynced from the
   * element whenever the drift is paused, so a manual scroll is not undone.
   */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let previous = 0;
    let position = el.scrollLeft;
    let quietUntil = 0;

    const settle = () => {
      quietUntil = Date.now() + RESUME_AFTER;
    };
    const onEnter = () => {
      hovering.current = true;
    };
    const onLeave = () => {
      hovering.current = false;
    };

    const held = () =>
      lightboxOpen.current ||
      hovering.current ||
      document.hidden ||
      Date.now() < quietUntil;

    const tick = (now: number) => {
      const elapsed = previous ? (now - previous) / 1000 : 0;
      previous = now;

      if (held()) {
        position = el.scrollLeft;
      } else {
        // One copy of the strip; wrapping here lands on an identical pixel.
        const span = el.scrollWidth / 2;
        position += DRIFT_PX_PER_SECOND * elapsed;
        if (span > 0 && position >= span) position -= span;
        el.scrollLeft = position;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    pause.current = settle;

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", settle);
    el.addEventListener("wheel", settle, { passive: true });
    el.addEventListener("touchstart", settle, { passive: true });
    el.addEventListener("keydown", settle);

    return () => {
      cancelAnimationFrame(frame);
      pause.current = null;
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", settle);
      el.removeEventListener("wheel", settle);
      el.removeEventListener("touchstart", settle);
      el.removeEventListener("keydown", settle);
    };
  }, []);

  const nudge = (dir: number) => {
    const el = scroller.current;
    if (!el) return;
    // Let the smooth scroll finish before the drift takes the wheel back.
    pause.current?.();
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <Reveal>
      <section id="gallery" className="relative w-full py-20 md:py-28">
        <Reveal shift={20} className="px-6 text-center">
          <h2 className="font-doulaise text-6xl md:text-8xl text-foreground leading-none">
            Our Gallery
          </h2>
          <p className="mt-5 text-foreground/70 text-[13px] font-helvetica">
            Scroll sideways — tap any photo to enlarge.
          </p>
        </Reveal>

        <div className="relative mt-10 md:mt-14">
          {/* The strip runs full-bleed and scrolls on its own. */}
          <div
            ref={scroller}
            className="overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:thin]"
          >
            <div className="flex w-max flex-col gap-2 px-6 md:gap-3">
              {lanes.map((lane, row) => (
                <div key={row} className="flex gap-2 md:gap-3">
                  {/* Each row is laid out twice. The drift wraps by
                      subtracting exactly one copy's width, so it lands on an
                      identical pixel and the loop is invisible — rewinding to
                      zero instead would be a visible snap back. The second
                      copy is hidden from assistive tech and the tab order so
                      the 123 photos are not announced twice. */}
                  {[0, 1].map((copy) =>
                    lane.map((p) => {
                      const i = indexOf(p);
                      const dup = copy === 1;
                      return (
                        <button
                          key={`${copy}-${p.thumb}`}
                          type="button"
                          onClick={() => setOpen(i)}
                          aria-hidden={dup || undefined}
                          tabIndex={dup ? -1 : undefined}
                          aria-label={
                            dup
                              ? undefined
                              : `Enlarge photo ${i + 1} of ${GALLERY.length}`
                          }
                          className="group relative block h-[150px] shrink-0 cursor-zoom-in overflow-hidden rounded-sm md:h-[230px]"
                          style={{ aspectRatio: `${p.w} / ${p.h}` }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.thumb}
                            alt=""
                            width={p.w}
                            height={p.h}
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            className="h-full w-full select-none object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 hidden items-end justify-center bg-foreground/35 pb-3 text-[9px] uppercase tracking-[0.25em] text-background opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 md:flex"
                          >
                            Tap to enlarge
                          </span>
                        </button>
                      );
                    }),
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fades that say "there is more this way" without a scrollbar. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent md:w-16"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent md:w-16"
          />

          {/* Pointer users get buttons; touch users already have the gesture. */}
          {[-1, 1].map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => nudge(dir)}
              aria-label={dir < 0 ? "Scroll left" : "Scroll right"}
              className={`absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-foreground/25 bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-foreground hover:text-background md:grid ${
                dir < 0 ? "left-3" : "right-3"
              }`}
            >
              {dir < 0 ? "‹" : "›"}
            </button>
          ))}
        </div>

        {photo && (
          <Portal>
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Photo ${(open ?? 0) + 1} of ${GALLERY.length}`}
              onClick={() => setOpen(null)}
              className="fixed inset-0 z-50 grid place-items-center bg-foreground/95 p-4 cursor-zoom-out animate-[fadeUp_0.25s_ease-out_both]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.full}
                alt=""
                onClick={(e) => e.stopPropagation()}
                className="max-h-[88vh] max-w-full object-contain"
                draggable={false}
              />

              {[-1, 1].map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(dir);
                  }}
                  aria-label={dir < 0 ? "Previous photo" : "Next photo"}
                  className={`fixed top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-background/35 bg-foreground/60 text-2xl leading-none text-background backdrop-blur-sm transition-colors hover:bg-background/20 ${
                    dir < 0 ? "left-4" : "right-4"
                  }`}
                >
                  {dir < 0 ? "‹" : "›"}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="fixed top-5 right-5 grid h-10 w-10 place-items-center rounded-full border border-background/40 bg-foreground/60 text-xl leading-none text-background backdrop-blur-sm transition-colors hover:bg-background/15"
              >
                &times;
              </button>

              <span className="pointer-events-none fixed bottom-5 left-0 right-0 text-center text-[10px] uppercase tracking-[0.3em] text-background/60">
                {(open ?? 0) + 1} / {GALLERY.length}
              </span>
            </div>
          </Portal>
        )}
      </section>
    </Reveal>
  );
}
