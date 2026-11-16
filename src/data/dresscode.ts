/**
 * The dress-code boards, when the couple have replaced them.
 *
 * The two boards the site ships with are graphics the couple had made — who
 * wears what, in the wedding colours. They get redrawn: a motif changes, a
 * role is added, the first version has a typo in it. Same story as the
 * gallery and the entourage, so it works the same way: a `Dress code` tab
 * beside a Drive folder, read at run time.
 *
 * **An empty tab means the boards built into the site.**
 */

import { RSVP_ENDPOINT, SITE_URL, hasEndpoint } from "./config";
import { shrink } from "./photos";
import { DRESS_BOARDS } from "./wedding";

/** One board, as the sheet holds it. */
export type DressBoard = {
  id: string;
  label: string;
  src: string;
  w: number;
  h: number;
};

/** What the page needs, which is the built-in shape plus alt text. */
export type DisplayBoard = { src: string; label: string; alt: string };

const CACHE_KEY = "dm-dresscode";

/**
 * Bigger than a gallery upload on purpose.
 *
 * A board is read, not glanced at — the lightbox exists so a guest can zoom
 * into "ninang in beige with a touch of navy blue" on a phone. Resizing it
 * down to a thumbnail would defeat the one thing the section is for.
 */
const BOARD_EDGE = 2200;

/**
 * Alt text for an uploaded board.
 *
 * The built-in boards carry real descriptions, written by hand. An upload
 * cannot — the couple are not going to type one, and inventing a description
 * of a picture nobody here has seen would be worse than admitting what is
 * known: this is the dress code, and this is who it is for.
 */
export function boardAlt(label: string) {
  const name = label.trim();
  return name ? `Dress code board — ${name}` : "Dress code board";
}

/** The boards the invitation should show, given what the sheet holds. */
export function toDisplay(boards: DressBoard[]): DisplayBoard[] {
  return boards.map((b) => ({
    src: b.src,
    label: b.label,
    alt: boardAlt(b.label),
  }));
}

/** The built-in boards, in the same shape. */
export const BUILT_IN_BOARDS: DisplayBoard[] = DRESS_BOARDS.map((b) => ({
  src: b.src,
  label: b.label,
  alt: b.alt,
}));

export async function listBoards(): Promise<DressBoard[]> {
  if (!hasEndpoint()) return [];
  const res = await fetch(`${RSVP_ENDPOINT}?board=dresscode`);
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error(data?.error || "Request failed");
  return Array.isArray(data.boards) ? (data.boards as DressBoard[]) : [];
}

export function cachedBoards(): DressBoard[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return Array.isArray(saved) && saved.length ? saved : null;
  } catch {
    return null;
  }
}

export function cacheBoards(boards: DressBoard[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(boards));
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
 * Copy the boards the site ships with into the sheet.
 *
 * Nothing is uploaded: the rows point at the files the site already serves,
 * so they stay fast and nothing is duplicated into Drive. What it buys is
 * that each board becomes a row, and only a row can be renamed or have its
 * picture swapped — which is the thing the couple actually want to do, since
 * there are two boards and both already exist.
 */
export async function seedBuiltInBoards(key: string) {
  const boards = DRESS_BOARDS.map((b, i) => ({
    label: b.label,
    src: absolute(b.src),
    // The shipped files, measured: a square sponsors board and a landscape
    // entourage one. Carried so the page can reserve the right space.
    w: i === 0 ? 1254 : 1536,
    h: i === 0 ? 1254 : 1024,
  }));
  const data = await post<{ ok: boolean; added?: number; error?: string }>({
    action: "dresscode.seed",
    key,
    boards,
  });
  if (!data.ok) throw new Error(data.error || "Request failed");
  return data.added ?? 0;
}

/** Swap the picture on a board, keeping its label and its place. */
export async function replaceBoardImage(
  key: string,
  id: string,
  file: File,
): Promise<DressBoard> {
  const { base64, w, h, type } = await shrink(file, BOARD_EDGE);
  const data = await post<{ ok: boolean; board?: DressBoard; error?: string }>({
    action: "dresscode.replace",
    key,
    id,
    image: base64,
    type,
    w,
    h,
  });
  if (!data.ok || !data.board) throw new Error(data.error || "Upload failed");
  return data.board;
}

/**
 * The shipped paths are site-relative, and the sheet is read by browsers on
 * the live domain. Only the origin is missing, and it has to be the published
 * one — a seed made from a dev server would write links no guest can open.
 */
function absolute(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path}`;
}

export async function addBoard(
  key: string,
  file: File,
  label: string,
): Promise<DressBoard> {
  const { base64, w, h, type } = await shrink(file, BOARD_EDGE);
  const data = await post<{ ok: boolean; board?: DressBoard; error?: string }>({
    action: "dresscode.add",
    key,
    image: base64,
    label,
    type,
    w,
    h,
  });
  if (!data.ok || !data.board) throw new Error(data.error || "Upload failed");
  return data.board;
}

export async function renameBoard(key: string, id: string, label: string) {
  const data = await post<{ ok: boolean; error?: string }>({
    action: "dresscode.label",
    key,
    id,
    label,
  });
  if (!data.ok) throw new Error(data.error || "Request failed");
}

export async function removeBoard(key: string, id: string) {
  const data = await post<{ ok: boolean; error?: string }>({
    action: "dresscode.remove",
    key,
    id,
  });
  if (!data.ok) throw new Error(data.error || "Request failed");
}

export async function clearBoards(key: string) {
  const data = await post<{ ok: boolean; removed?: number; error?: string }>({
    action: "dresscode.clear",
    key,
  });
  if (!data.ok) throw new Error(data.error || "Request failed");
  return data.removed ?? 0;
}
