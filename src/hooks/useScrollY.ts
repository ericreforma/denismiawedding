"use client";

import { useEffect, useState } from "react";

/**
 * Tracks window.scrollY. Starts at 0 so SSR and the first client render agree,
 * then syncs on the first scroll event — exactly like the original.
 */
export function useScrollY(): number {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scrollY;
}
