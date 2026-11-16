"use client";

import { useEffect } from "react";

import { Portal } from "../Portal";

/**
 * What the dashboard is doing, while it is doing it.
 *
 * `done`/`total` are only set where a job has countable parts — a dozen
 * photos going up one at a time. Everything else is a single step and says
 * so in words.
 */
export type BusyTask = {
  label: string;
  done?: number;
  total?: number;
};

/**
 * A modal held open for the length of a save, an upload or a delete.
 *
 * Deliberately not dismissible. Every one of these writes to the couple's
 * sheet or their Drive, and the failure they invite is the human kind:
 * tapping Delete again because the first tap looked like it did nothing,
 * leaving the gallery page mid-upload, reordering the entourage while the
 * previous save is still in flight. A door that cannot be opened is a cruder
 * answer than disabling each control in turn, and a much harder one to get
 * wrong.
 *
 * It takes the keyboard and the scroll with it, so Escape and a flick of the
 * thumb cannot get behind it either.
 */
export function BusyDialog({ task }: { task: BusyTask | null }) {
  useEffect(() => {
    if (!task) return;
    const stop = (e: KeyboardEvent) => {
      // Escape would otherwise dismiss nothing and look like it failed.
      if (e.key === "Escape" || e.key === "Enter") e.preventDefault();
    };
    document.addEventListener("keydown", stop, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", stop, true);
      document.body.style.overflow = prev;
    };
  }, [task]);

  if (!task) return null;

  const counted =
    typeof task.done === "number" && typeof task.total === "number";
  const pct = counted
    ? Math.round((task.done! / Math.max(task.total!, 1)) * 100)
    : null;

  return (
    <Portal>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-busy="true"
        aria-label={task.label}
        className="fixed inset-0 z-[60] grid place-items-center bg-foreground/55 px-6 backdrop-blur-[2px]"
      >
        <div className="w-full max-w-xs rounded-xl border border-foreground/15 bg-background px-6 py-7 text-center shadow-[0_18px_50px_-20px_hsl(var(--foreground)/0.6)]">
          <span
            aria-hidden
            className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground"
          />

          <p
            aria-live="polite"
            className="mt-5 font-sans text-[14px] leading-relaxed text-foreground"
          >
            {task.label}
          </p>

          {counted && (
            <>
              <div
                className="mt-4 h-1 w-full overflow-hidden rounded-full bg-foreground/15"
                role="progressbar"
                aria-valuenow={task.done}
                aria-valuemin={0}
                aria-valuemax={task.total}
              >
                <span
                  className="block h-full rounded-full bg-foreground transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 font-sans text-[12px] tabular-nums text-foreground/55">
                {task.done} of {task.total}
              </p>
            </>
          )}

          <p className="mt-4 font-sans text-[11.5px] leading-relaxed text-foreground/45">
            Please keep this page open.
          </p>
        </div>
      </div>
    </Portal>
  );
}
