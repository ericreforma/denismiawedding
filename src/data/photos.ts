/**
 * The gallery, when the couple have made it their own.
 *
 * The strip's 123 photos are baked into the build (`src/data/gallery.ts`,
 * written by `scripts/build-gallery.mjs`), which is the right way to serve
 * images the repo ships: resized once, cached forever, free. It is also the
 * reason they cannot be changed without a developer — and the couple asked to
 * change them.
 *
 * So there is a second source. A `Gallery` tab in the couple's sheet holds a
 * row per photo, the files sit in their Drive, and the strip reads the list at
 * run time. **An empty tab means the built-in photoshoot**, so the site looks
 * exactly as it does today until the moment they upload something.
 *
 * The cost is honest and worth saying: these photos come from Drive rather
 * than from the site's own domain, so they are not on the CDN the rest of the
 * invitation is on, and a very large gallery will feel slower than the baked
 * one. For a reshuffled set of favourites it is not noticeable.
 */

import { RSVP_ENDPOINT, SITE_URL, hasEndpoint } from "./config";
import { GALLERY, type GalleryPhoto } from "./gallery";

/** A photo as the sheet holds it. `id` is what removing one addresses. */
export type Photo = GalleryPhoto & { id: string; label: string };

/** Where the last list is kept, so a second visit paints the right photos. */
const CACHE_KEY = "dm-gallery";

/**
 * The longest edge an upload is resized to before it is sent.
 *
 * Phone photos run 3–8MB, and base64 adds a third again on the way up — a
 * dozen of those would take minutes on a Philippine mobile connection and
 * some would simply fail. 1920px is more than the lightbox can show on any
 * screen the couple's guests own.
 */
const MAX_EDGE = 1920;
const QUALITY = 0.82;

export async function listPhotos(): Promise<Photo[]> {
  if (!hasEndpoint()) return [];
  const res = await fetch(`${RSVP_ENDPOINT}?board=gallery`);
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error(data?.error || "Request failed");
  return Array.isArray(data.photos) ? data.photos : [];
}

/** The cached list, for painting before the network answers. */
export function cachedPhotos(): Photo[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return Array.isArray(saved) && saved.length ? saved : null;
  } catch {
    return null;
  }
}

export function cachePhotos(photos: Photo[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(photos));
  } catch {
    /* Not caching is only slower, never wrong. */
  }
}

async function post<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(RSVP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new Error(`Request failed (${res.status})`);
  return data as T;
}

/**
 * Shrink a chosen file to something sendable, and report its new size.
 *
 * Drawing through a canvas also strips the EXIF block, which carries the GPS
 * coordinates a phone writes into every photo — worth losing on its own for
 * pictures that are about to be public.
 *
 * The one thing EXIF carries that is worth keeping is orientation, and
 * `createImageBitmap` with `imageOrientation: "from-image"` applies it before
 * the draw, so a portrait photo off an iPhone does not arrive on its side.
 *
 * `maxEdge` is adjustable because a dress-code board is read rather than
 * glanced at — its small print needs more pixels than a gallery thumbnail.
 */
export async function shrink(file: File, maxEdge: number = MAX_EDGE) {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
  if (!blob) throw new Error("Could not read that image");

  return { base64: await toBase64(blob), w, h, type: "image/jpeg" };
}

function toBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    // The data URL's payload starts after the comma; the script wants only it.
    reader.onload = () =>
      resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.readAsDataURL(blob);
  });
}

export async function addPhoto(key: string, file: File): Promise<Photo> {
  const { base64, w, h, type } = await shrink(file);
  const data = await post<{ ok: boolean; photo?: Photo; error?: string }>({
    action: "gallery.add",
    key,
    image: base64,
    label: file.name.replace(/\.[^.]+$/, "").slice(0, 120),
    type,
    w,
    h,
  });
  if (!data.ok || !data.photo) throw new Error(data.error || "Upload failed");
  return data.photo;
}

export async function removePhoto(key: string, id: string) {
  const data = await post<{ ok: boolean; error?: string }>({
    action: "gallery.remove",
    key,
    id,
  });
  if (!data.ok) throw new Error(data.error || "Request failed");
}

/**
 * Copy the built-in photoshoot into the sheet, so those photos can be removed
 * one at a time like any other. Nothing is uploaded — the rows point at the
 * files the site already ships.
 */
export async function seedBuiltIn(key: string) {
  const photos = GALLERY.map((p, i) => ({
    label: `Photoshoot ${i + 1}`,
    thumb: absolute(p.thumb),
    full: absolute(p.full),
    w: p.w,
    h: p.h,
  }));
  const data = await post<{ ok: boolean; added?: number; error?: string }>({
    action: "gallery.seed",
    key,
    photos,
  });
  if (!data.ok) throw new Error(data.error || "Request failed");
  return data.added ?? 0;
}

export async function clearPhotos(key: string) {
  const data = await post<{ ok: boolean; removed?: number; error?: string }>({
    action: "gallery.clear",
    key,
  });
  if (!data.ok) throw new Error(data.error || "Request failed");
  return data.removed ?? 0;
}

/**
 * The built-in paths are site-relative, and the sheet is read by browsers on
 * the live domain — so they are stored absolute, against the address guests
 * actually use rather than wherever the dashboard happened to be running.
 */
function absolute(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  // The path already carries the base path, so only the origin is missing —
  // and it has to be the published one, not localhost, or a seed made from a
  // dev server would write links no guest can open.
  return `${SITE_URL}${path}`;
}
