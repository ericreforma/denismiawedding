"use client";

import { useEffect, useState } from "react";

import {
  BUILT_IN_BOARDS,
  cacheBoards,
  cachedBoards,
  listBoards,
  toDisplay,
  type DisplayBoard,
} from "@/data/dresscode";

/**
 * Which dress-code boards the invitation should show.
 *
 * The same three sources as the gallery and the entourage: the cache for an
 * instant correct first paint, the built-in boards for anyone without one,
 * and the sheet a moment later to settle it. An empty answer means the couple
 * have not replaced them, so the built-in boards stand.
 */
export function useDressBoards(): DisplayBoard[] {
  const [boards, setBoards] = useState<DisplayBoard[]>(BUILT_IN_BOARDS);

  useEffect(() => {
    const cached = cachedBoards();
    if (cached) setBoards(toDisplay(cached));

    let live = true;
    listBoards()
      .then((fresh) => {
        if (!live) return;
        if (fresh.length) {
          setBoards(toDisplay(fresh));
          cacheBoards(fresh);
        } else {
          setBoards(BUILT_IN_BOARDS);
          cacheBoards([]);
        }
      })
      .catch(() => {
        /* Whatever is already showing stays showing. */
      });
    return () => {
      live = false;
    };
  }, []);

  return boards;
}
