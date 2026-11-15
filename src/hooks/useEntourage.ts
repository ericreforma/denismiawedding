"use client";

import { useEffect, useState } from "react";

import { ENTOURAGE } from "@/data/wedding";
import {
  cacheEntourage,
  cachedEntourage,
  fromRows,
  listEntourage,
  type EntourageData,
} from "@/data/entourage";

/**
 * The wedding party the invitation should show.
 *
 * Same three sources, in the same order, as the gallery: this browser's cache
 * for an instant correct first paint, the built-in list for everyone who has
 * no cache, then the sheet a moment later to settle it. An empty answer from
 * the sheet means the couple have not edited the list, not that it is broken.
 *
 * Names are never left blank while waiting. A guest looking for their own
 * name in the entourage and finding an empty column would assume they had
 * been dropped from the wedding party.
 */
export function useEntourage(): EntourageData {
  const [data, setData] = useState<EntourageData>(ENTOURAGE);

  useEffect(() => {
    const cached = cachedEntourage();
    if (cached) setData(fromRows(cached));

    let live = true;
    listEntourage()
      .then((rows) => {
        if (!live) return;
        if (rows.length) {
          setData(fromRows(rows));
          cacheEntourage(rows);
        } else {
          setData(ENTOURAGE);
          cacheEntourage([]);
        }
      })
      .catch(() => {
        /* Whatever is already showing stays showing. */
      });
    return () => {
      live = false;
    };
  }, []);

  return data;
}
