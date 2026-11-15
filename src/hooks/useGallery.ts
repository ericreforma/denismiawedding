"use client";

import { useEffect, useState } from "react";

import { GALLERY, type GalleryPhoto } from "@/data/gallery";
import { cachePhotos, cachedPhotos, listPhotos } from "@/data/photos";

/**
 * Which photos the strip shows.
 *
 * Three sources, in the order they can be had:
 *
 * 1. **The cache**, instantly, if this browser has seen the couple's own set
 *    before. A returning guest gets the right photos in the first paint.
 * 2. **The built-in photoshoot**, instantly, if it has not. This is also the
 *    answer for everyone until the couple upload anything at all.
 * 3. **The sheet**, a moment later, which settles it either way — an empty
 *    list there means the built-in set is the gallery, not that it is broken.
 *
 * The swap in case 2 is the one visible cost, and only on a first visit after
 * the couple have customised. Nothing is ever left blank while waiting, which
 * matters more: an empty strip reads as a broken page.
 */
export function useGallery(): GalleryPhoto[] {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(GALLERY);

  useEffect(() => {
    const cached = cachedPhotos();
    if (cached) setPhotos(cached);

    let live = true;
    listPhotos()
      .then((fresh) => {
        if (!live) return;
        if (fresh.length) {
          setPhotos(fresh);
          cachePhotos(fresh);
        } else {
          // The couple have not customised, or have cleared it back.
          setPhotos(GALLERY);
          cachePhotos([]);
        }
      })
      .catch(() => {
        /* Whatever is already showing stays showing. */
      });
    return () => {
      live = false;
    };
  }, []);

  return photos;
}
