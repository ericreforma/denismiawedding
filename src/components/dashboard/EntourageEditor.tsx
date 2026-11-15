"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  SECTIONS,
  clearEntourage,
  listEntourage,
  looksCorrupt,
  saveEntourage,
  toRows,
  type EntourageRow,
  type EntourageSection,
} from "@/data/entourage";
import { ENTOURAGE } from "@/data/wedding";
import { hasEndpoint } from "@/data/config";

type Load =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready" }
  | { state: "saving" }
  | { state: "error"; message: string };

/**
 * The wedding party, editable.
 *
 * Names are edited as a block of text, one per line, rather than as a field
 * each. It is the quickest thing to use — a list can be pasted straight in
 * from wherever the couple keep it — and it sidesteps the fiddliest part of a
 * list editor, which is adding and removing single rows on a phone.
 *
 * Nothing is written until **Save**, so a half-finished edit is never live.
 */
export function EntourageEditor({ passcode }: { passcode: string }) {
  const [rows, setRows] = useState<EntourageRow[]>([]);
  const [saved, setSaved] = useState<EntourageRow[]>([]);
  /** Whether the sheet holds a list at all, or the site is on the built-in. */
  const [custom, setCustom] = useState(false);
  const [load, setLoad] = useState<Load>({ state: "idle" });
  const [open, setOpen] = useState<EntourageSection | null>(null);

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
      const fromSheet = await listEntourage();
      // Nothing saved yet means the site is showing the built-in list, so
      // that is what the couple should see here and start editing from.
      //
      // Damaged rows are treated the same way. The guests are already being
      // shown the built-in list by the same rule, and opening the editor on
      // the wreckage would only invite them to save it back.
      const usable = fromSheet.length > 0 && !looksCorrupt(fromSheet);
      const start = usable ? fromSheet : toRows(ENTOURAGE);
      setRows(start);
      setSaved(start);
      setCustom(usable);
      setLoad({ state: "ready" });
    } catch {
      setLoad({
        state: "error",
        message:
          "Couldn't reach the entourage list. Check your connection, then try again.",
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dirty = useMemo(
    () => JSON.stringify(rows) !== JSON.stringify(saved),
    [rows, saved],
  );

  const edit = (index: number, patch: Partial<EntourageRow>) =>
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );

  const addBlock = (section: EntourageSection) =>
    setRows((prev) => {
      const blank: EntourageRow = {
        section,
        title: "",
        line: "",
        item: "",
        names: [],
      };
      // Put it after the last block of its own section, so the order the
      // guests read matches the order on this page.
      let at = prev.length;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].section === section) {
          at = i + 1;
          break;
        }
      }
      return [...prev.slice(0, at), blank, ...prev.slice(at)];
    });

  const removeBlock = (index: number) => {
    const row = rows[index];
    const what = row.title || row.line || "this block";
    if (!window.confirm(`Remove ${what}?\n\nNothing is saved until you tap Save.`))
      return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const move = (index: number, by: number) =>
    setRows((prev) => {
      const to = index + by;
      if (to < 0 || to >= prev.length) return prev;
      if (prev[to].section !== prev[index].section) return prev;
      const next = [...prev];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });

  const save = async () => {
    setLoad({ state: "saving" });
    try {
      const keep = rows.filter(
        (r) => r.title.trim() || r.line.trim() || r.names.length,
      );
      await saveEntourage(passcode, keep);
      setRows(keep);
      setSaved(keep);
      setCustom(true);
      setLoad({ state: "ready" });
    } catch {
      setLoad({
        state: "error",
        message: "Couldn't save the entourage. Nothing was changed. Try again.",
      });
    }
  };

  const revert = async () => {
    if (
      !window.confirm(
        "Go back to the list the website was built with?\n\nEverything you have saved here is removed, and the original list comes back.",
      )
    )
      return;
    setLoad({ state: "saving" });
    try {
      await clearEntourage(passcode);
      const start = toRows(ENTOURAGE);
      setRows(start);
      setSaved(start);
      setCustom(false);
      setLoad({ state: "ready" });
    } catch {
      setLoad({
        state: "error",
        message: "Couldn't restore the original list. Please try again.",
      });
    }
  };

  const busy = load.state === "saving" || load.state === "loading";

  return (
    <>
      <div className="mt-8 rounded-xl border border-foreground/15 bg-card px-5 py-5">
        <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-foreground/60">
          {custom ? "Your edited list" : "The original list"}
        </p>
        <p className="mt-2 font-sans text-[13px] leading-relaxed text-foreground/70">
          Write one name on each line. Nothing on your website changes until
          you tap <span className="text-foreground">Save</span>.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={save}
            disabled={!dirty || busy}
            className="rounded-full bg-foreground px-6 py-2.5 font-sans text-[11px] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {load.state === "saving"
              ? "Saving…"
              : dirty
                ? "Save changes"
                : "Saved"}
          </button>
          {dirty && (
            <button
              type="button"
              onClick={() => setRows(saved)}
              disabled={busy}
              className="rounded-full border border-foreground/25 px-5 py-2.5 font-sans text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
            >
              Undo my changes
            </button>
          )}
          {custom && !dirty && (
            <button
              type="button"
              onClick={revert}
              disabled={busy}
              className="rounded-full px-5 py-2.5 font-sans text-[11px] uppercase tracking-[0.16em] text-foreground/45 transition-colors hover:text-foreground disabled:opacity-40"
            >
              Back to the original list
            </button>
          )}
        </div>

        {dirty && (
          <p className="mt-3 font-sans text-[12px] text-foreground/60">
            You have changes that are not saved yet.
          </p>
        )}
      </div>

      {load.state === "error" && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-foreground/20 bg-foreground/5 px-5 py-4 font-sans text-[14px] leading-relaxed"
        >
          {load.message}
        </p>
      )}

      {load.state === "loading" && (
        <p className="mt-10 font-sans text-[14px] text-foreground/60">
          Loading the entourage…
        </p>
      )}

      <div className="mt-5 space-y-3">
        {SECTIONS.map((section) => {
          const mine = rows
            .map((row, index) => ({ row, index }))
            .filter(({ row }) => row.section === section.key);
          const isOpen = open === section.key;
          const count = mine.reduce((n, { row }) => n + row.names.length, 0);

          return (
            <section
              key={section.key}
              className="overflow-hidden rounded-xl border border-foreground/15 bg-card"
            >
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : section.key)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg leading-tight">
                      {section.label}
                    </span>
                    <span className="mt-0.5 block font-sans text-[12px] text-foreground/50">
                      {count} {count === 1 ? "name" : "names"}
                      {section.hint && ` · ${section.hint}`}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`shrink-0 font-sans text-[15px] text-foreground/40 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ⌄
                  </span>
                </button>
              </h3>

              {isOpen && (
                <div className="space-y-5 px-5 pb-6">
                  {mine.map(({ row, index }, n) => (
                    <div
                      key={`${section.key}-${n}`}
                      className="rounded-lg border border-foreground/15 px-4 py-4"
                    >
                      {section.shape === "group" ? (
                        <label className="block">
                          <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-foreground/55">
                            Heading
                          </span>
                          <input
                            value={row.title}
                            onChange={(e) => edit(index, { title: e.target.value })}
                            placeholder="Ninongs"
                            className="mt-1.5 w-full rounded-lg border border-foreground/20 bg-background px-3.5 py-2.5 font-sans text-[16px] focus:border-foreground/50 focus:outline-none md:text-[14px]"
                          />
                        </label>
                      ) : (
                        <>
                          <label className="block">
                            <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-foreground/55">
                              Their line
                            </span>
                            <input
                              value={row.line}
                              onChange={(e) => edit(index, { line: e.target.value })}
                              placeholder="To tie our hearts as one"
                              className="mt-1.5 w-full rounded-lg border border-foreground/20 bg-background px-3.5 py-2.5 font-sans text-[16px] focus:border-foreground/50 focus:outline-none md:text-[14px]"
                            />
                          </label>
                          <label className="mt-3 block">
                            <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-foreground/55">
                              What they carry (optional)
                            </span>
                            <input
                              value={row.item}
                              onChange={(e) => edit(index, { item: e.target.value })}
                              placeholder="Ring bearer"
                              className="mt-1.5 w-full rounded-lg border border-foreground/20 bg-background px-3.5 py-2.5 font-sans text-[16px] focus:border-foreground/50 focus:outline-none md:text-[14px]"
                            />
                          </label>
                        </>
                      )}

                      <label className="mt-3 block">
                        <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-foreground/55">
                          Names — one on each line
                        </span>
                        <textarea
                          value={row.names.join("\n")}
                          onChange={(e) =>
                            edit(index, {
                              // Kept as typed, blank lines and all, so a line
                              // being cleared does not jump the cursor.
                              names: e.target.value.split("\n"),
                            })
                          }
                          onBlur={() =>
                            edit(index, {
                              names: row.names
                                .map((n) => n.trim())
                                .filter(Boolean),
                            })
                          }
                          rows={Math.max(3, row.names.length + 1)}
                          placeholder={"Mr. Juan dela Cruz\nMrs. Maria Santos"}
                          className="mt-1.5 w-full resize-y rounded-lg border border-foreground/20 bg-background px-3.5 py-2.5 font-sans text-[16px] leading-relaxed focus:border-foreground/50 focus:outline-none md:text-[14px]"
                        />
                      </label>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => move(index, -1)}
                          disabled={n === 0}
                          className="rounded-full border border-foreground/20 px-3.5 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] text-foreground/65 transition-colors hover:bg-foreground hover:text-background disabled:opacity-30"
                        >
                          Move up
                        </button>
                        <button
                          type="button"
                          onClick={() => move(index, 1)}
                          disabled={n === mine.length - 1}
                          className="rounded-full border border-foreground/20 px-3.5 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] text-foreground/65 transition-colors hover:bg-foreground hover:text-background disabled:opacity-30"
                        >
                          Move down
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(index)}
                          className="rounded-full px-3.5 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] text-foreground/45 transition-colors hover:text-foreground"
                        >
                          Remove this block
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addBlock(section.key)}
                    className="rounded-full border border-foreground/25 px-5 py-2.5 font-sans text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-foreground hover:text-background"
                  >
                    Add another block here
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
