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

    if (!("IntersectionObserver" in window)) {
      document
        .querySelectorAll<HTMLElement>(".reveal")
        .forEach((n) => n.classList.add("is-visible"));
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

    const watch = (node: HTMLElement) => {
      if (node.classList.contains("is-visible")) return;
      io.observe(node);
    };

    document.querySelectorAll<HTMLElement>(".reveal").forEach(watch);

    /**
     * Sections that arrive late have to be caught too.
     *
     * The gallery, the entourage and the dress-code boards all paint the
     * built-in content first and swap to the couple's own a moment later.
     * A swap changes each item's React key, so the old nodes are thrown away
     * and new ones take their place — nodes this sweep has already run past.
     * Unobserved, they keep `.reveal`'s opacity of 0 for good: present in the
     * page, correct, loaded, and invisible.
     *
     * That is what happened to the dress code, and it would have happened to
     * the other two the first time the couple edited them.
     */
    const mo = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.classList.contains("reveal")) watch(node);
          node.querySelectorAll<HTMLElement>(".reveal").forEach(watch);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, [ready]);
}
