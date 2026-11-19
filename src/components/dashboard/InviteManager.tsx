"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createInvite,
  deleteInvite,
  inviteLink,
  listInvites,
  resetInvite,
  setInviteEntourage,
  type InviteRecord,
} from "@/data/invite";
import { hasEndpoint } from "@/data/config";
import { StatTile } from "./StatTile";
import { BusyDialog, type BusyTask } from "./BusyDialog";

type Load =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready" }
  | { state: "error"; message: string };

/**
 * One personal link per guest, and what has become of it.
 *
 * The couple type a name, get a link, and send it. The link is bound to the
 * first device that opens it, so this is also where they see who has opened
 * theirs — and where they undo a binding that landed on the wrong person.
 */
export function InviteManager({ passcode }: { passcode: string }) {
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [load, setLoad] = useState<Load>({ state: "idle" });
  const [name, setName] = useState("");
  /**
   * Whether the next link shows the wedding party.
   *
   * Off by default: most guests get the shorter invitation, and the entourage
   * are the exception. It stays as the couple last left it between links, so
   * doing all the ninongs in a row is one tick rather than twenty.
   */
  const [entourage, setEntourage] = useState(false);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  /** The token whose row is mid-action, so only that row shows it. */
  const [busy, setBusy] = useState<string | null>(null);
  /** The token just created, held so its link can be shown front and centre. */
  const [fresh, setFresh] = useState<InviteRecord | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [task, setTask] = useState<BusyTask | null>(null);

  const refresh = useCallback(async () => {
    if (!hasEndpoint()) {
      setLoad({
        state: "error",
        message:
          "This dashboard is not connected to a spreadsheet yet. Add the Apps Script URL to src/data/config.ts — see docs/rsvp-setup.md.",
      });
      return;
    }
    setLoad({ state: "loading" });
    try {
      setInvites(await listInvites(passcode));
      setLoad({ state: "ready" });
    } catch (err) {
      setLoad({
        state: "error",
        message:
          String(err).includes("unauthorized")
            ? "That passcode was not accepted."
            : "Couldn't reach the invitation list. Check your connection, then try again.",
      });
    }
  }, [passcode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const counts = useMemo(() => {
    const opened = invites.filter((i) => i.claimed).length;
    return { total: invites.length, opened, waiting: invites.length - opened };
  }, [invites]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = q
      ? invites.filter((i) => i.name.toLowerCase().includes(q))
      : invites;
    // Newest first: the link they just made is the one they want to send.
    return [...out].sort(
      (a, b) => (Date.parse(b.created) || 0) - (Date.parse(a.created) || 0),
    );
  }, [invites, query]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const who = name.trim();
    if (!who || creating) return;
    setCreating(true);
    setLoad({ state: "ready" });
    setTask({ label: `Making a link for ${who}…` });
    try {
      const token = await createInvite(passcode, who, entourage);
      const made: InviteRecord = {
        token,
        name: who,
        claimed: false,
        device: "",
        firstOpened: "",
        lastOpened: "",
        opens: 0,
        created: new Date().toISOString(),
        entourage,
      };
      setInvites((prev) => [made, ...prev]);
      setFresh(made);
      setName("");
      copy(made.token);
    } catch {
      setLoad({
        state: "error",
        message: `Couldn't create a link for ${who}. Please try again.`,
      });
    } finally {
      setCreating(false);
      setTask(null);
    }
  };

  /**
   * `navigator.clipboard` needs a secure context and is missing from some
   * in-app browsers, so there is a fallback — the couple will do this on a
   * phone, and a Copy button that silently does nothing is worse than none.
   */
  const copy = (token: string) => {
    const link = inviteLink(token);
    const done = () => {
      setCopied(token);
      setTimeout(() => setCopied((c) => (c === token ? null : c)), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(done, () => fallback(link, done));
    } else {
      fallback(link, done);
    }
  };

  const reset = async (invite: InviteRecord) => {
    if (busy) return;
    const ok = window.confirm(
      `Are you sure you want to reset this link?\n\nThe phone that opened ${invite.name}'s link loses access, and the next one to open it takes its place. Send them the link again afterwards.`,
    );
    if (!ok) return;
    setBusy(invite.token);
    setTask({ label: `Resetting ${invite.name}'s link…` });
    try {
      await resetInvite(passcode, invite.token);
      setInvites((prev) =>
        prev.map((i) =>
          i.token === invite.token
            ? {
                ...i,
                claimed: false,
                device: "",
                firstOpened: "",
                lastOpened: "",
                opens: 0,
              }
            : i,
        ),
      );
    } catch {
      setLoad({
        state: "error",
        message: `Couldn't reset ${invite.name}'s link. Please try again.`,
      });
    } finally {
      setBusy(null);
      setTask(null);
    }
  };

  const toggleEntourage = async (invite: InviteRecord) => {
    if (busy) return;
    setBusy(invite.token);
    setTask({
      label: invite.entourage
        ? `Removing the entourage from ${invite.name}'s invitation…`
        : `Adding the entourage to ${invite.name}'s invitation…`,
    });
    try {
      await setInviteEntourage(passcode, invite.token, !invite.entourage);
      setInvites((prev) =>
        prev.map((i) =>
          i.token === invite.token ? { ...i, entourage: !i.entourage } : i,
        ),
      );
      setFresh((f) =>
        f?.token === invite.token ? { ...f, entourage: !f.entourage } : f,
      );
    } catch {
      setLoad({
        state: "error",
        message: `Couldn't change ${invite.name}'s invitation. Please try again.`,
      });
    } finally {
      setBusy(null);
      setTask(null);
    }
  };

  const remove = async (invite: InviteRecord) => {
    if (busy) return;
    const ok = window.confirm(
      `Are you sure you want to delete this invitation?\n\n${invite.name}'s link stops working for good. This cannot be undone.`,
    );
    if (!ok) return;
    setBusy(invite.token);
    setTask({ label: `Deleting ${invite.name}'s invitation…` });
    try {
      await deleteInvite(passcode, invite.token);
      setInvites((prev) => prev.filter((i) => i.token !== invite.token));
      setFresh((f) => (f?.token === invite.token ? null : f));
    } catch {
      setLoad({
        state: "error",
        message: `Couldn't delete ${invite.name}'s invitation. Please try again.`,
      });
    } finally {
      setBusy(null);
      setTask(null);
    }
  };

  return (
    <>
      <BusyDialog task={task} />

      <form onSubmit={create} className="mt-8">
        <label htmlFor="invite-name" className="block">
          <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-foreground/60">
            Invite someone
          </span>
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="invite-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Their name, as it should appear"
            className="w-full rounded-full border border-foreground/20 bg-card px-5 py-3 font-sans text-[16px] placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none sm:flex-1 md:py-2.5 md:text-[14px]"
          />
          <button
            type="submit"
            disabled={!name.trim() || creating}
            className="whitespace-nowrap rounded-full bg-foreground px-6 py-3 font-sans text-[12px] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-40 md:py-2.5"
          >
            {creating ? "Creating…" : "Create link"}
          </button>
        </div>

        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-foreground/15 bg-card px-4 py-3.5">
          <input
            type="checkbox"
            checked={entourage}
            onChange={(e) => setEntourage(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(var(--foreground))]"
          />
          <span className="min-w-0">
            <span className="block font-sans text-[13px] text-foreground">
              Include the entourage
            </span>
            <span className="mt-0.5 block font-sans text-[12px] leading-relaxed text-foreground/55">
              Tick this for the wedding party themselves. Everyone else still
              sees the couple and their parents — just not the sponsors,
              attendants, groomsmen, bridesmaids or bearers.
            </span>
          </span>
        </label>
      </form>

      {fresh && (
        <div className="mt-4 rounded-xl border border-foreground/25 bg-card px-4 py-4">
          <p className="font-sans text-[12px] uppercase tracking-[0.18em] text-foreground/55">
            Link for {fresh.name}
            {copied === fresh.token && " · copied"}
          </p>
          <p className="mt-1 font-sans text-[12px] text-foreground/60">
            {fresh.entourage
              ? "With the entourage."
              : "Without the entourage."}
          </p>
          <p className="mt-2 break-all font-mono text-[12px] leading-relaxed text-foreground/80">
            {inviteLink(fresh.token)}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => copy(fresh.token)}
              className="rounded-full border border-foreground/25 px-4 py-2 font-sans text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-foreground hover:text-background"
            >
              {copied === fresh.token ? "Copied" : "Copy again"}
            </button>
            <button
              type="button"
              onClick={() => setFresh(null)}
              className="rounded-full px-4 py-2 font-sans text-[11px] uppercase tracking-[0.16em] text-foreground/50 transition-colors hover:text-foreground"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {load.state === "error" && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-foreground/20 bg-foreground/5 px-5 py-4 font-sans text-[14px] leading-relaxed"
        >
          {load.message}
        </p>
      )}

      <section className="mt-8 grid grid-cols-3 gap-2.5 md:gap-4">
        <StatTile label="Invitations" value={counts.total} />
        <StatTile label="Opened" value={counts.opened} emphasis />
        <StatTile label="Not yet" value={counts.waiting} />
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="block sm:flex-1">
          <span className="sr-only">Search invitations</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a name…"
            className="w-full rounded-full border border-foreground/20 bg-card px-5 py-3 font-sans text-[16px] placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2.5 md:text-[14px]"
          />
        </label>
        <button
          type="button"
          onClick={refresh}
          disabled={load.state === "loading"}
          className="whitespace-nowrap rounded-full border border-foreground/25 px-4 py-3 font-sans text-[12px] uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-50 md:py-2.5"
        >
          {load.state === "loading" ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {load.state === "loading" && invites.length === 0 && (
        <p className="mt-10 font-sans text-[14px] text-foreground/60">
          Loading invitations…
        </p>
      )}

      {load.state !== "loading" && shown.length === 0 && (
        <p className="mt-6 rounded-lg border border-dashed border-foreground/20 px-6 py-10 text-center font-sans text-[14px] text-foreground/55">
          {invites.length === 0
            ? "No invitations yet. Type a name above to make the first link."
            : "No invitation matches that search."}
        </p>
      )}

      <ul className="mt-5 space-y-3">
        {shown.map((invite) => (
          <li
            key={invite.token}
            className="overflow-hidden rounded-xl border border-foreground/15 bg-card px-4 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 break-words font-display text-xl leading-tight">
                {invite.name}
              </p>
              <span
                className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 font-sans text-[11px] uppercase tracking-[0.12em] ${
                  invite.claimed
                    ? "bg-foreground text-background"
                    : "border border-foreground/25 text-foreground/60"
                }`}
              >
                {invite.claimed ? "Opened" : "Not opened"}
              </span>
            </div>

            <p className="mt-1.5 font-sans text-[12px] leading-relaxed text-foreground/55">
              {invite.entourage ? "With entourage" : "No entourage"}
              {" · "}
              {invite.claimed
                ? `${invite.device || "Unknown device"} · first opened ${when(invite.firstOpened)}${
                    invite.opens > 1 ? ` · ${invite.opens} visits` : ""
                  }`
                : `Created ${when(invite.created)} · waiting to be opened`}
            </p>

            <p className="mt-3 break-all font-mono text-[11px] leading-relaxed text-foreground/45">
              {inviteLink(invite.token)}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copy(invite.token)}
                className="rounded-full border border-foreground/25 px-4 py-2 font-sans text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-foreground hover:text-background"
              >
                {copied === invite.token ? "Copied" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={() => reset(invite)}
                disabled={!invite.claimed || busy === invite.token}
                title={
                  invite.claimed
                    ? "Release the device that opened this link"
                    : "Nothing has opened this link yet"
                }
                className="rounded-full border border-foreground/25 px-4 py-2 font-sans text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-foreground"
              >
                {busy === invite.token ? "Working…" : "Reset device"}
              </button>
              <button
                type="button"
                onClick={() => toggleEntourage(invite)}
                disabled={busy === invite.token}
                title={
                  invite.entourage
                    ? "Send this guest the invitation without the wedding party"
                    : "Send this guest the invitation with the wedding party"
                }
                className="rounded-full border border-foreground/25 px-4 py-2 font-sans text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-35"
              >
                {invite.entourage ? "Drop entourage" : "Add entourage"}
              </button>
              <button
                type="button"
                onClick={() => remove(invite)}
                disabled={busy === invite.token}
                className="rounded-full px-4 py-2 font-sans text-[11px] uppercase tracking-[0.16em] text-foreground/45 transition-colors hover:text-foreground disabled:opacity-35"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Last resort for browsers without the clipboard API. */
function fallback(text: string, done: () => void) {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    el.remove();
    done();
  } catch {
    window.prompt("Copy this link:", text);
  }
}

function when(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts || "—";
  return d.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
