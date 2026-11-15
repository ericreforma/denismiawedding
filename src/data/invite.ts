/**
 * Personal invitation links: `/?youareinvited=<token>`.
 *
 * ## Why a token rather than an encrypted name
 *
 * The site is a static export. Anything it can decrypt, a guest can decrypt
 * too — the key would sit in the JavaScript bundle, where "view source" finds
 * it in a minute. A name encrypted that way is not private, and a lock built
 * on it is not a lock: anyone could mint a link for any name.
 *
 * So the link carries an opaque random token instead, and the name lives in
 * the couple's sheet beside it. The Apps Script is the only thing that can
 * turn one into the other, and it will not do it for the wrong device. The
 * link looks the same to everyone who receives one; it is simply the half of
 * the pair that is safe to send.
 *
 * ## The device lock, honestly
 *
 * There is no such thing as reading a device's identity from a browser. What
 * is actually stored is a random id this browser generated on its first visit
 * and kept in `localStorage`, so "same device" really means "same browser,
 * same profile, storage not cleared". That is the strongest handle a web page
 * has, and it is worth knowing where it lets go:
 *
 * - Opening the link in Messenger or Instagram first and in Chrome second
 *   reads as two devices, because an in-app browser has its own storage.
 * - A private window never remembers, so each one claims as new.
 * - Clearing site data releases the invitation.
 *
 * Every one of those shows up as a guest being turned away from their own
 * invitation, and the fix each time is the dashboard's Reset — which is also
 * the fix for a link that the wrong person opened first.
 */

import { RSVP_ENDPOINT, SITE_URL, hasEndpoint } from "./config";

/** The query parameter the couple's links carry. */
export const INVITE_PARAM = "youareinvited";

/**
 * Whether the invitation is personal links only.
 *
 * `false` — today — means the site stays public and a token only adds the
 * personal layer on top. Setting it to `true` turns the address itself into
 * something only a named guest can open: anyone arriving without a working
 * token gets the closed screen. Left off because the couple share the plain
 * address too, and because every device-lock false positive (see below)
 * would otherwise lock a real guest out of the invitation entirely.
 */
export const INVITE_ONLY = false;

/** Where this browser's id is kept between visits. */
const DEVICE_KEY = "dm-device-id";

/**
 * - `ok` — the token is real and this device holds it.
 * - `blocked` — the token is real and another device claimed it first.
 * - `unknown` — no such token. Treated as an ordinary visit, not an error:
 *   a mistyped or truncated link should land on the invitation, not a wall.
 * - `offline` — the script could not be reached. Also treated as ordinary,
 *   because a guest with a flaky connection should still see the invitation.
 */
export type InviteStatus = "ok" | "blocked" | "unknown" | "offline";

export type InviteClaim = {
  status: InviteStatus;
  /** Only ever present on `ok`. */
  name?: string;
  /** True the first time this invitation was opened at all. */
  firstOpen?: boolean;
};

/** One invitation, as the dashboard reads it back. */
export type InviteRecord = {
  token: string;
  name: string;
  /** Whether a device has claimed it — i.e. whether it has been opened. */
  claimed: boolean;
  /** What that device calls itself, for the couple to recognise. */
  device: string;
  firstOpened: string;
  lastOpened: string;
  opens: number;
  created: string;
};

/** The link to send a guest. */
export function inviteLink(token: string) {
  return `${SITE_URL}/?${INVITE_PARAM}=${encodeURIComponent(token)}`;
}

/**
 * This browser's id, made on first use and kept afterwards.
 *
 * Where storage is blocked — a private window, a browser set to refuse site
 * data — there is nothing to remember, so a per-session id is used instead.
 * It claims and re-claims within the one visit and is forgotten after, which
 * is the gentlest of the available failures: the guest gets in.
 */
export function deviceId() {
  const fresh = () =>
    `d-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  try {
    const saved = localStorage.getItem(DEVICE_KEY);
    if (saved) return saved;
    const made = fresh();
    localStorage.setItem(DEVICE_KEY, made);
    return made;
  } catch {
    return fresh();
  }
}

/**
 * A human label for the row in the sheet — "iPhone · Safari", near enough.
 *
 * This is for the couple's eyes, so they can tell "opened on her phone" from
 * "opened on something I don't recognise". It is not identity: it is not
 * unique, and it is trivially spoofed. The random id above does the deciding.
 */
export function deviceLabel() {
  if (typeof navigator === "undefined") return "Unknown device";
  const ua = navigator.userAgent;

  const os = /iPhone/i.test(ua)
    ? "iPhone"
    : /iPad/i.test(ua)
      ? "iPad"
      : /Android/i.test(ua)
        ? "Android"
        : /Windows/i.test(ua)
          ? "Windows"
          : /Mac OS X/i.test(ua)
            ? "Mac"
            : /Linux/i.test(ua)
              ? "Linux"
              : "Unknown";

  // Order matters: every one of these also says "Safari" or "Chrome".
  const browser = /FBAN|FBAV|FB_IAB/i.test(ua)
    ? "Facebook app"
    : /Instagram/i.test(ua)
      ? "Instagram app"
      : /Line\//i.test(ua)
        ? "LINE app"
        : /EdgA?\//i.test(ua)
          ? "Edge"
          : /OPR\//i.test(ua)
            ? "Opera"
            : /SamsungBrowser/i.test(ua)
              ? "Samsung Internet"
              : /Firefox\//i.test(ua)
                ? "Firefox"
                : /CriOS|Chrome\//i.test(ua)
                  ? "Chrome"
                  : /Safari\//i.test(ua)
                    ? "Safari"
                    : "Browser";

  return `${os} · ${browser}`;
}

/**
 * POST to the Apps Script.
 *
 * `text/plain` for the same reason the RSVP form uses it: `application/json`
 * makes the browser send a CORS preflight, and an Apps Script web app cannot
 * answer one. The body is JSON regardless.
 */
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

/** The guest's side: hand over the token, find out whether it is theirs. */
export async function claimInvite(token: string): Promise<InviteClaim> {
  if (!hasEndpoint()) return { status: "offline" };
  try {
    const data = await post<{
      ok: boolean;
      status?: InviteStatus;
      name?: string;
      firstOpen?: boolean;
    }>({
      action: "invite.claim",
      token,
      deviceId: deviceId(),
      device: deviceLabel(),
    });
    if (!data.ok || !data.status) return { status: "offline" };
    return { status: data.status, name: data.name, firstOpen: data.firstOpen };
  } catch {
    return { status: "offline" };
  }
}

// ----------------------------------------------------------- the dashboard

export async function listInvites(key: string): Promise<InviteRecord[]> {
  const url = `${RSVP_ENDPOINT}?board=invites&key=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => null);
  if (data?.error === "unauthorized") throw new Error("unauthorized");
  if (!res.ok || !data?.ok) throw new Error(data?.error || "Request failed");
  return Array.isArray(data.invites) ? data.invites : [];
}

export async function createInvite(key: string, name: string) {
  const data = await post<{ ok: boolean; token?: string; error?: string }>({
    action: "invite.create",
    key,
    name,
  });
  if (!data.ok || !data.token) throw new Error(data.error || "Request failed");
  return data.token;
}

export async function resetInvite(key: string, token: string) {
  const data = await post<{ ok: boolean; error?: string }>({
    action: "invite.reset",
    key,
    token,
  });
  if (!data.ok) throw new Error(data.error || "Request failed");
}

export async function deleteInvite(key: string, token: string) {
  const data = await post<{ ok: boolean; error?: string }>({
    action: "invite.delete",
    key,
    token,
  });
  if (!data.ok) throw new Error(data.error || "Request failed");
}
