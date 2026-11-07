"use client";

import { useEffect } from "react";

/**
 * Adds `.is-visible` to every `.reveal` once it scrolls into view, and leaves
 * it there — the original only animates on first sight (framer's `once: true`).
 */
export function useReveal() {
  useEffect(() => {
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
  }, []);
}
