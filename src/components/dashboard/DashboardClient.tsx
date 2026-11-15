"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { COUPLE, EVENT } from "@/data/wedding";
import { RSVP_ENDPOINT, hasEndpoint, type RsvpEntry } from "@/data/config";
import { StatTile } from "./StatTile";
import { PasscodeGate } from "./PasscodeGate";
import { ReplyTable } from "./ReplyTable";
import { InviteManager } from "./InviteManager";
import { GalleryManager } from "./GalleryManager";
import { Documentation } from "./Documentation";
import { EntourageEditor } from "./EntourageEditor";
import { toCsv, downloadCsv } from "./csv";

/** Remembered so a refresh does not ask for the passcode again. */
const PASSCODE_KEY = "dm-rsvp-passcode";

type Tab = "replies" | "invites" | "gallery" | "entourage" | "guide";
type Filter = "all" | "yes" | "no";
type Sort = "newest" | "oldest" | "name";

type Load =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready"; entries: RsvpEntry[]; at: Date }
  | { state: "error"; message: string };

export function DashboardClient() {
  const [passcode, setPasscode] = useState<string | null>(null);
  const [load, setLoad] = useState<Load>({ state: "idle" });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [tab, setTab] = useState<Tab>("replies");

  // Restore a passcode from a previous visit before the first fetch.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PASSCODE_KEY);
      if (saved) setPasscode(saved);
    } catch {
      /* Private mode blocks storage; the gate just asks again. */
    }
  }, []);

  const fetchEntries = useCallback(
    async (code: string) => {
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
        const url = `${RSVP_ENDPOINT}?board=rsvps&key=${encodeURIComponent(code)}`;
        const res = await fetch(url);
        const data = await res.json().catch(() => null);

        if (data?.error === "unauthorized") {
          try {
            sessionStorage.removeItem(PASSCODE_KEY);
          } catch {
            /* nothing to clear */
          }
          setPasscode(null);
          setLoad({
            state: "error",
            message: "That passcode was not accepted. Please try again.",
          });
          return;
        }
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || `Request failed (${res.status})`);
        }

        setLoad({
          state: "ready",
          entries: Array.isArray(data.entries) ? data.entries : [],
          at: new Date(),
        });
      } catch {
        setLoad({
          state: "error",
          message:
            "Couldn't reach the guest list. Check your connection, then try again.",
        });
      }
    },
    [],
  );

  useEffect(() => {
    if (passcode) fetchEntries(passcode);
  }, [passcode, fetchEntries]);

  const unlock = (code: string) => {
    try {
      sessionStorage.setItem(PASSCODE_KEY, code);
    } catch {
      /* Not remembering it is fine. */
    }
    setPasscode(code);
  };

  const signOut = () => {
    try {
      sessionStorage.removeItem(PASSCODE_KEY);
    } catch {
      /* nothing to clear */
    }
    setPasscode(null);
    setLoad({ state: "idle" });
  };

  const entries = load.state === "ready" ? load.entries : [];

  const counts = useMemo(() => {
    const yes = entries.filter((e) => isYes(e.attending)).length;
    const no = entries.filter((e) => !isYes(e.attending)).length;
    return { total: entries.length, yes, no };
  }, [entries]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = entries.filter((e) => {
      if (filter === "yes" && !isYes(e.attending)) return false;
      if (filter === "no" && isYes(e.attending)) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q)
      );
    });
    out = [...out].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      const ta = Date.parse(a.timestamp) || 0;
      const tb = Date.parse(b.timestamp) || 0;
      return sort === "oldest" ? ta - tb : tb - ta;
    });
    return out;
  }, [entries, query, filter, sort]);

  if (!passcode) {
    return (
      <PasscodeGate
        onSubmit={unlock}
        error={load.state === "error" ? load.message : null}
      />
    );
  }

  return (
    <main className="min-h-[100svh] bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        {/* Stacked on a phone, shoulder to shoulder from sm up: the title and
            the two actions never fit on one narrow line without the buttons
            wrapping underneath half-width. */}
        <header className="flex flex-col gap-4 border-b border-foreground/15 pb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-foreground/50">
              RSVP Dashboard
            </p>
            <h1 className="mt-2 font-display text-[1.75rem] leading-tight sm:text-3xl md:text-4xl">
              {COUPLE.one.first} &amp; {COUPLE.two.first}
            </h1>
            <p className="mt-1 font-sans text-[13px] text-foreground/60">
              {EVENT.dateLong} · replies close {EVENT.rsvpBy}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {tab === "replies" && (
              <button
                type="button"
                onClick={() => fetchEntries(passcode)}
                disabled={load.state === "loading"}
                className="flex-1 rounded-full border border-foreground/25 px-4 py-2.5 font-sans text-[12px] uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-50 sm:flex-none sm:py-2"
              >
                {load.state === "loading" ? "Refreshing…" : "Refresh"}
              </button>
            )}
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border border-foreground/15 px-5 py-2.5 font-sans text-[12px] uppercase tracking-[0.18em] text-foreground/50 transition-colors hover:text-foreground sm:border-transparent sm:px-3 sm:py-2"
            >
              Lock
            </button>
          </div>
        </header>

        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="mt-6 grid grid-cols-2 gap-1 rounded-[1.5rem] border border-foreground/20 p-1 sm:inline-grid sm:w-auto sm:grid-cols-[auto_auto_auto_auto_auto] sm:gap-0 sm:rounded-full"
        >
          {(
            [
              ["replies", "Replies"],
              ["invites", "Invitations"],
              ["gallery", "Gallery"],
              ["entourage", "Entourage"],
              ["guide", "Documentation"],
            ] as [Tab, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={tab === v}
              onClick={() => setTab(v)}
              className={`rounded-full px-3 py-2.5 font-sans text-[11px] uppercase tracking-[0.1em] transition-colors sm:px-5 sm:text-[12px] sm:tracking-[0.14em] md:py-1.5 ${
                tab === v
                  ? "bg-foreground text-background"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "invites" && <InviteManager passcode={passcode} />}

        {tab === "gallery" && <GalleryManager passcode={passcode} />}

        {tab === "entourage" && <EntourageEditor passcode={passcode} />}

        {tab === "guide" && <Documentation />}

        {tab === "replies" && load.state === "error" && (
          <p
            role="alert"
            className="mt-8 rounded-lg border border-foreground/20 bg-foreground/5 px-5 py-4 font-sans text-[14px] leading-relaxed"
          >
            {load.message}
          </p>
        )}

        {tab === "replies" && load.state === "loading" && entries.length === 0 && (
          <p className="mt-10 font-sans text-[14px] text-foreground/60">
            Loading replies…
          </p>
        )}

        {tab === "replies" && load.state === "ready" && (
          <>
            <section className="mt-8 grid grid-cols-3 gap-2.5 md:gap-4">
              <StatTile label="Replies" value={counts.total} />
              <StatTile label="Attending" value={counts.yes} emphasis />
              <StatTile label="Cannot come" value={counts.no} />
            </section>

            {/* A phone gets one control per row — search, then the filter as
                a full-width three-up, then sort and export sharing a line.
                From md up they run together on a single flex row. */}
            <section className="mt-8 space-y-3 md:flex md:flex-wrap md:items-center md:gap-3 md:space-y-0">
              <label className="relative block md:min-w-[12rem] md:flex-1">
                <span className="sr-only">Search replies</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a name or message…"
                  className="w-full rounded-full border border-foreground/20 bg-card px-5 py-3 font-sans text-[16px] placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none md:py-2.5 md:text-[14px]"
                />
              </label>

              <div
                role="group"
                aria-label="Filter by attendance"
                className="grid grid-cols-3 rounded-full border border-foreground/20 p-1 md:flex"
              >
                {(
                  [
                    ["all", "All"],
                    ["yes", "Attending"],
                    ["no", "Cannot come"],
                  ] as [Filter, string][]
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFilter(v)}
                    aria-pressed={filter === v}
                    className={`rounded-full px-2 py-2.5 font-sans text-[11px] uppercase tracking-[0.1em] transition-colors md:px-3.5 md:py-1.5 md:text-[12px] md:tracking-[0.14em] ${
                      filter === v
                        ? "bg-foreground text-background"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* `md:contents` dissolves this row from md up, so the two
                  controls rejoin the flex line above. */}
              <div className="flex gap-3 md:contents">
                <label className="flex-1 font-sans text-[12px] text-foreground/60 md:flex-none">
                  <span className="sr-only">Sort replies</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    className="w-full rounded-full border border-foreground/20 bg-card px-4 py-3 font-sans text-[16px] text-foreground focus:border-foreground/50 focus:outline-none md:w-auto md:py-2.5 md:text-[13px]"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">By name</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      `rsvp-${new Date().toISOString().slice(0, 10)}.csv`,
                      toCsv(shown),
                    )
                  }
                  disabled={shown.length === 0}
                  className="flex-1 whitespace-nowrap rounded-full border border-foreground/25 px-4 py-3 font-sans text-[12px] uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-40 md:flex-none md:py-2.5"
                >
                  Export CSV
                </button>
              </div>
            </section>

            <p className="mt-5 font-sans text-[12px] text-foreground/50">
              {shown.length === entries.length
                ? `${entries.length} ${entries.length === 1 ? "reply" : "replies"}`
                : `${shown.length} of ${entries.length} shown`}
              {" · updated "}
              {load.at.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            <ReplyTable entries={shown} total={entries.length} />
          </>
        )}
      </div>
    </main>
  );
}

/** The sheet may hold "yes", "Yes", or the full label; treat them alike. */
export function isYes(v: string) {
  const s = String(v || "").trim().toLowerCase();
  return s === "yes" || s.startsWith("joyfully");
}
