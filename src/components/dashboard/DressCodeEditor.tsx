"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  addBoard,
  clearBoards,
  listBoards,
  removeBoard,
  renameBoard,
  replaceBoardImage,
  seedBuiltInBoards,
  type DressBoard,
} from "@/data/dresscode";
import { DRESS_BOARDS } from "@/data/wedding";
import { hasEndpoint } from "@/data/config";
import { explain } from "@/data/explain";

type Load =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready" }
  | { state: "error"; message: string };

/**
 * The dress-code boards, replaceable.
 *
 * Editing one means copying the shipped boards into the sheet first, because
 * a board that is not a row cannot be changed. That copy used to happen by
 * itself the moment this tab was opened, which was wrong: it froze whatever
 * the site shipped at that moment into the sheet, and the sheet overrides the
 * site — so a board added to the code afterwards could never appear, and
 * nobody would connect the two. Merely looking at this page should not take
 * the list over.
 *
 * So it is a button now. Until it is pressed the site's own boards are what
 * everyone sees, and anything added in code still arrives.
 *
 * A label is asked for *before* the file picker opens when adding a new
 * board, because the label is what a guest reads above the picture — "For our
 * Ninong & Ninang" — and an untitled board is worse than no board.
 */
export function DressCodeEditor({ passcode }: { passcode: string }) {
  const [boards, setBoards] = useState<DressBoard[]>([]);
  const [load, setLoad] = useState<Load>({ state: "idle" });
  const [busy, setBusy] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState("");
  const picker = useRef<HTMLInputElement>(null);
  /** The picker for swapping one board's picture, and whose it is. */
  const swapper = useRef<HTMLInputElement>(null);
  const swapping = useRef<string | null>(null);

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
      setBoards(await listBoards());
      setLoad({ state: "ready" });
    } catch {
      setLoad({
        state: "error",
        message:
          "Couldn't reach the dress code boards. Check your connection, then try again.",
      });
    }
  }, [passcode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload = async (files: FileList | null) => {
    const file = files?.[0];
    if (picker.current) picker.current.value = "";
    if (!file) return;

    setUploading(true);
    setLoad({ state: "ready" });
    try {
      const board = await addBoard(passcode, file, label.trim() || "Dress code");
      setBoards((prev) => [...prev, board]);
      setLabel("");
    } catch (err) {
      setLoad({
        state: "error",
        message: explain("Couldn't add that picture.", err),
      });
    } finally {
      setUploading(false);
    }
  };

  const takeOver = async () => {
    if (
      !window.confirm(
        `Make these ${DRESS_BOARDS.length} pictures editable?

Nothing changes on your website. They are copied here so you can swap or rename them one at a time.`,
      )
    )
      return;
    setBusy("all");
    try {
      await seedBuiltInBoards(passcode);
      setBoards(await listBoards());
    } catch (err) {
      setLoad({
        state: "error",
        message: explain("Couldn't copy the pictures in.", err),
      });
    } finally {
      setBusy(null);
    }
  };

  const swap = async (files: FileList | null) => {
    const file = files?.[0];
    const id = swapping.current;
    if (swapper.current) swapper.current.value = "";
    swapping.current = null;
    if (!file || !id) return;

    setBusy(id);
    try {
      const updated = await replaceBoardImage(passcode, id, file);
      setBoards((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updated } : b)),
      );
    } catch (err) {
      setLoad({
        state: "error",
        message: explain("Couldn't change that picture.", err),
      });
    } finally {
      setBusy(null);
    }
  };

  const rename = async (board: DressBoard, next: string) => {
    const name = next.trim();
    if (!name || name === board.label) return;
    setBusy(board.id);
    try {
      await renameBoard(passcode, board.id, name);
      setBoards((prev) =>
        prev.map((b) => (b.id === board.id ? { ...b, label: name } : b)),
      );
    } catch {
      setLoad({
        state: "error",
        message: "Couldn't rename that board. Please try again.",
      });
      refresh();
    } finally {
      setBusy(null);
    }
  };

  const remove = async (board: DressBoard) => {
    if (busy) return;
    if (
      !window.confirm(
        `Remove "${board.label}"?\n\nThe picture goes to your Drive bin, where it can be recovered for 30 days.`,
      )
    )
      return;
    setBusy(board.id);
    try {
      await removeBoard(passcode, board.id);
      setBoards((prev) => prev.filter((b) => b.id !== board.id));
    } catch (err) {
      setLoad({
        state: "error",
        message: explain("Couldn't remove that picture.", err),
      });
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    if (
      !window.confirm(
        "Go back to the boards your website was built with?\n\nYour uploads go to your Drive bin, recoverable for 30 days.",
      )
    )
      return;
    setBusy("all");
    try {
      await clearBoards(passcode);
      setBoards([]);
    } catch {
      setLoad({
        state: "error",
        message: "Couldn't restore the original boards. Please try again.",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className="mt-8 rounded-xl border border-foreground/15 bg-card px-5 py-5">
        <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-foreground/60">
          Dress code pictures
        </p>
        <p className="mt-2 font-sans text-[13px] leading-relaxed text-foreground/70">
          {boards.length === 0 ? (
            <>
              Your website is showing the {DRESS_BOARDS.length} pictures it was
              built with. To swap or rename one of them yourself, make them
              editable first.
            </>
          ) : (
            <>
              {boards.length}{" "}
              {boards.length === 1 ? "picture" : "pictures"}, shown in this
              order. To change one, tap{" "}
              <span className="text-foreground">Change picture</span> on it.
              Guests tap any of them to see it full screen.
            </>
          )}
        </p>

        {boards.length === 0 && (
          <button
            type="button"
            onClick={takeOver}
            disabled={busy === "all"}
            className="mt-4 rounded-full bg-foreground px-5 py-2.5 font-sans text-[11px] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy === "all" ? "Copying…" : "Make these editable"}
          </button>
        )}

        <p className="mt-5 font-sans text-[11px] uppercase tracking-[0.25em] text-foreground/60">
          Add another one
        </p>

        <label htmlFor="board-label" className="mt-2 block">
          <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-foreground/55">
            Who is this picture for?
          </span>
          {/* Off-screen rather than `hidden`: Safari on iOS will not open a
            file picker for an input that is `display: none`, which fails
            silently — no dialog, no error, nothing to report. */}
        <input
            id="board-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="For our Ninong &amp; Ninang"
            className="mt-1.5 w-full rounded-lg border border-foreground/20 bg-background px-3.5 py-2.5 font-sans text-[16px] placeholder:text-foreground/35 focus:border-foreground/50 focus:outline-none md:text-[14px]"
          />
          <span className="mt-1.5 block font-sans text-[12px] leading-relaxed text-foreground/55">
            This is written above the picture on your website.
          </span>
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => picker.current?.click()}
            disabled={uploading || !label.trim()}
            className="rounded-full bg-foreground px-5 py-2.5 font-sans text-[11px] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {uploading ? "Uploading…" : "Choose a picture"}
          </button>

          {boards.length > 0 && (
            <button
              type="button"
              onClick={restore}
              disabled={busy === "all" || uploading}
              className="rounded-full px-5 py-2.5 font-sans text-[11px] uppercase tracking-[0.16em] text-foreground/45 transition-colors hover:text-foreground disabled:opacity-40"
            >
              {busy === "all" ? "Restoring…" : "Back to the original boards"}
            </button>
          )}
        </div>

        {!label.trim() && (
          <p className="mt-3 font-sans text-[12px] text-foreground/55">
            Write who the picture is for first, then choose it.
          </p>
        )}

        <input
          ref={picker}
          type="file"
          accept="image/*"
          className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
          onChange={(e) => upload(e.target.files)}
        />
        <input
          ref={swapper}
          type="file"
          accept="image/*"
          className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
          onChange={(e) => swap(e.target.files)}
        />
      </div>

      {load.state === "error" && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-foreground/20 bg-foreground/5 px-5 py-4 font-sans text-[14px] leading-relaxed"
        >
          {load.message}
        </p>
      )}

      {load.state === "loading" && boards.length === 0 && (
        <p className="mt-10 font-sans text-[14px] text-foreground/60">
          Loading the dress code boards…
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {boards.map((board) => (
          <li
            key={board.id}
            className="overflow-hidden rounded-xl border border-foreground/15 bg-card px-4 py-4"
          >
            <label className="block">
              <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-foreground/55">
                Who it is for
              </span>
              <input
                defaultValue={board.label}
                onBlur={(e) => rename(board, e.target.value)}
                disabled={busy === board.id}
                className="mt-1.5 w-full rounded-lg border border-foreground/20 bg-background px-3.5 py-2.5 font-sans text-[16px] focus:border-foreground/50 focus:outline-none disabled:opacity-50 md:text-[14px]"
              />
            </label>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={board.src}
              alt={board.label}
              loading="lazy"
              decoding="async"
              className="mt-3 block w-full rounded-lg border border-foreground/10"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  swapping.current = board.id;
                  swapper.current?.click();
                }}
                disabled={busy === board.id}
                className="rounded-full border border-foreground/25 px-4 py-2 font-sans text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-35"
              >
                {busy === board.id ? "Working…" : "Change picture"}
              </button>
              <button
                type="button"
                onClick={() => remove(board)}
                disabled={busy === board.id}
                className="rounded-full px-4 py-2 font-sans text-[11px] uppercase tracking-[0.16em] text-foreground/45 transition-colors hover:text-foreground disabled:opacity-35"
              >
                Remove this picture
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
