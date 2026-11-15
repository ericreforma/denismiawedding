"use client";

import { useEffect } from "react";

/**
 * Adds `.is-visible` to every `.reveal` once it scrolls into view, and leaves
 * it there — the original only animates on first sight (framer's `once: true`).
 *
 * `ready` exists because the sections are not always in the DOM when this
 * first runs. The invitation sits behind a gate that renders in its place
 * until the guest's token has been checked, and `.reveal` starts at opacity 0
 * — so a sweep taken while the gate is up finds nothing to observe, and every
 * section that mounts afterwards stays invisible for good. Pass the condition
 * the content appears under and the sweep is taken again when it does.
 */
export function useReveal(ready: boolean = true) {
  useEffect(() => {
    if (!ready) return;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (nodes.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [ready]);
}
