"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  INVITE_ONLY,
  INVITE_PARAM,
  claimInvite,
  recall,
  type InviteStatus,
} from "@/data/invite";

/**
 * How the page sees whoever is reading it.
 *
 * - `checking` — the token is being verified. Nothing of the invitation is
 *   shown yet: a closed site that flashes its contents first is not closed.
 * - `greeting` — the token is theirs and their name is known, held for a beat
 *   so the guest sees the invitation is addressed to them before it opens.
 * - `welcome` — a real token, held by this device. The invitation proper.
 * - `closed` — no token at all. Someone has the bare address.
 * - `invalid` — a token the sheet does not know. A link edited, truncated by
 *   a messaging app, or typed out by hand with a character wrong.
 * - `blocked` — a real token that another device claimed first.
 * - `offline` — the script could not be reached, so nothing could be proved
 *   either way. Kept separate from the rest because it is the one state that
 *   is the site's fault, and the one worth offering a retry for.
 */
export type GuestState =
  | "checking"
  | "greeting"
  | "welcome"
  | "closed"
  | "invalid"
  | "blocked"
  | "offline";

export type Guest = {
  state: GuestState;
  /** The invited person's name, once the script has confirmed it is theirs. */
  name: string | null;
  /** The token from the link. */
  token: string | null;
  /**
   * Whether this guest's invitation lists the wedding party.
   *
   * The couple send two versions: most guests get the shorter one, and the
   * entourage themselves get the full one. It defaults to `true` everywhere
   * it is not known, so a missing answer never silently removes a section a
   * guest was meant to see.
   */
  entourage: boolean;
  /** Re-run the check. Only meaningful from `offline`. */
  retry: () => void;
};

const GuestContext = createContext<Guest>({
  state: INVITE_ONLY ? "closed" : "welcome",
  name: null,
  token: null,
  entourage: true,
  retry: () => {},
});

/** What the invitation knows about who is reading it. */
export function useGuest() {
  return useContext(GuestContext);
}

/**
 * Reads `?youareinvited=…`, asks the Apps Script whose it is, and puts the
 * answer where the page can reach it.
 *
 * With `INVITE_ONLY` on, every state but `welcome` is a closed door — a
 * missing token and an invented one included. That is the point: a token the
 * sheet cannot match is not a guest, however much it looks like one.
 *
 * With it off, only a token that provably belongs to another device closes
 * the door; everything else falls through to the ordinary invitation.
 */
export function InviteProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GuestState>("checking");
  const [name, setName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [entourage, setEntourage] = useState(true);
  /** Bumped by `retry` to re-run the effect. */
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setState("checking");
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    const found = new URLSearchParams(window.location.search)
      .get(INVITE_PARAM)
      ?.trim();
    setToken(found || null);

    if (!found) {
      setState(INVITE_ONLY ? "closed" : "welcome");
      return;
    }

    let live = true;
    claimInvite(found).then((claim) => {
      if (!live) return;

      // Unreachable script, but this browser passed with this same token
      // before: let them back in rather than shut a known guest out over a
      // dropped connection.
      if (claim.status === "offline") {
        const known = recall(found);
        if (known) {
          setName(known.name);
          setEntourage(known.entourage);
          setState(known.name ? "greeting" : "welcome");
          return;
        }
      }

      const who = claim.name?.trim() || null;
      setName(who);
      setEntourage(claim.entourage !== false);
      const next = resolve(claim.status);
      // A recognised guest is greeted by name first. Everyone else — and a
      // guest whose name somehow came back empty — goes straight through.
      setState(next === "welcome" && who ? "greeting" : next);
    });
    return () => {
      live = false;
    };
  }, [attempt]);

  /**
   * How long the guest's name is held on screen before the invitation opens.
   *
   * Long enough to read a name and feel addressed, short enough that nobody
   * waiting to get in notices they were made to wait.
   */
  useEffect(() => {
    if (state !== "greeting") return;
    const t = setTimeout(() => setState("welcome"), 1600);
    return () => clearTimeout(t);
  }, [state]);

  const value = useMemo(
    () => ({ state, name, token, entourage, retry }),
    [state, name, token, entourage, retry],
  );
  return (
    <GuestContext.Provider value={value}>{children}</GuestContext.Provider>
  );
}

function resolve(status: InviteStatus): GuestState {
  if (status === "ok") return "welcome";
  if (status === "blocked") return "blocked";
  if (status === "unknown") return INVITE_ONLY ? "invalid" : "welcome";
  // offline
  return INVITE_ONLY ? "offline" : "welcome";
}
