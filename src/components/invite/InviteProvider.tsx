"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { INVITE_PARAM, claimInvite, type InviteStatus } from "@/data/invite";

/**
 * How the page sees the guest.
 *
 * `checking` is its own state because the claim is a network round trip, and
 * a greeting that pops in halfway through the intro reads as a glitch. The
 * overlay covers it: by the time anyone has tapped through, this has settled.
 */
export type Guest = {
  state: "none" | "checking" | "welcome" | "blocked";
  /** The invited person's name, once the script has confirmed it is theirs. */
  name: string | null;
  /** The token from the link, kept for the RSVP to send back with the reply. */
  token: string | null;
};

const GuestContext = createContext<Guest>({
  state: "none",
  name: null,
  token: null,
});

/** What the invitation knows about who is reading it. */
export function useGuest() {
  return useContext(GuestContext);
}

/**
 * Reads `?youareinvited=…`, asks the Apps Script whose it is, and puts the
 * answer where the page can reach it.
 *
 * A visitor with no token is `none` and sees the ordinary invitation — the
 * site stays public, and the token is the personal layer on top. Flip
 * `INVITE_ONLY` in `src/data/invite.ts` if the couple ever want the stricter
 * version, where only a named guest gets in at all.
 */
export function InviteProvider({ children }: { children: React.ReactNode }) {
  const [guest, setGuest] = useState<Guest>({
    state: "none",
    name: null,
    token: null,
  });

  useEffect(() => {
    const token = new URLSearchParams(window.location.search)
      .get(INVITE_PARAM)
      ?.trim();
    if (!token) return;

    setGuest({ state: "checking", name: null, token });

    let live = true;
    claimInvite(token).then((claim) => {
      if (!live) return;
      setGuest({
        state: stateFor(claim.status),
        name: claim.name?.trim() || null,
        token,
      });
    });
    return () => {
      live = false;
    };
  }, []);

  const value = useMemo(() => guest, [guest]);
  return (
    <GuestContext.Provider value={value}>{children}</GuestContext.Provider>
  );
}

/**
 * An unrecognised token, or one that could not be checked, falls through to
 * the ordinary invitation rather than to the wall. A guest whose link got
 * truncated by a messaging app, or who is on a train, should still see that
 * they are invited — only a token that demonstrably belongs to someone else
 * is turned away.
 */
function stateFor(status: InviteStatus): Guest["state"] {
  if (status === "ok") return "welcome";
  if (status === "blocked") return "blocked";
  return "none";
}
