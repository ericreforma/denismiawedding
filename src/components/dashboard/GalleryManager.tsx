"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  addPhoto,
  clearPhotos,
  listPhotos,
  removePhoto,
  seedBuiltIn,
  type Photo,
} from "@/data/photos";
import { GALLERY } from "@/data/gallery";
import { hasEndpoint } from "@/data/config";
import { explain } from "@/data/explain";

type Load =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready" }
  | { state: "error"; message: string };

/** One file's journey, so a dozen at once can each report for themselves. */
type Job = { name: string; state: "waiting" | "sending" | "done" | "failed" };

export function GalleryManager({ passcode }: { passcode: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [load, setLoad] = useState<Load>({ state: "idle" });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const picker = useRef<HTMLInputElement>(null);

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
      setPhotos(await listPhotos());
      setLoad({ state: "ready" });
    } catch {
      setLoad({
        state: "error",
        message:
          "Couldn't reach the gallery. Check your connection, then try again.",
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Uploads run one at a time on purpose. Apps Script takes one request at a
   * time per script anyway, and a dozen photos fired at once on a phone
   * connection is how you get a handful of silent timeouts instead of a queue
   * that visibly works through itself.
   */
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const chosen = Array.from(files);
    setJobs(chosen.map((f) => ({ name: f.name, state: "waiting" })));
    setLoad({ state: "ready" });

    for (let i = 0; i < chosen.length; i++) {
      setJobs((prev) =>
        prev.map((j, n) => (n === i ? { ...j, state: "sending" } : j)),
      );
      try {
        const photo = await addPhoto(passcode, chosen[i]);
        setPhotos((prev) => [...prev, photo]);
        setJobs((prev) =>
          prev.map((j, n) => (n === i ? { ...j, state: "done" } : j)),
        );
      } catch (err) {
        setJobs((prev) =>
          prev.map((j, n) => (n === i ? { ...j, state: "failed" } : j)),
        );
        setLoad({
          state: "error",
          message: explain(`Couldn't add ${chosen[i].name}.`, err),
        });
      }
    }
    // Clear the input, or picking the same file again does nothing.
    if (picker.current) picker.current.value = "";
  };

  const remove = async (photo: Photo) => {
    if (busy) return;
    const ok = window.confirm(
      `Remove this photo from the gallery?\n\nAn uploaded one goes to your Drive bin, where it can be recovered for 30 days.`,
    );
    if (!ok) return;
    setBusy(photo.id);
    try {
      await removePhoto(passcode, photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      setLoad({
        state: "error",
        message: explain("Couldn't remove that photo.", err),
      });
    } finally {
      setBusy(null);
    }
  };

  const seed = async () => {
    if (seeding) return;
    const ok = window.confirm(
      `Copy the ${GALLERY.length} built-in photos into the gallery?\n\nNothing is uploaded — they keep using the files the site already ships. You can then remove them one at a time.`,
    );
    if (!ok) return;
    setSeeding(true);
    try {
      await seedBuiltIn(passcode);
      await refresh();
    } catch (err) {
      setLoad({
        state: "error",
        message: explain("Couldn't copy the built-in photos.", err),
      });
    } finally {
      setSeeding(false);
    }
  };

  const clear = async () => {
    const ok = window.confirm(
      `Empty the gallery?\n\nThe site goes back to showing the built-in photoshoot. Uploaded photos go to your Drive bin, recoverable for 30 days.`,
    );
    if (!ok) return;
    setBusy("all");
    try {
      await clearPhotos(passcode);
      setPhotos([]);
    } catch (err) {
      setLoad({
        state: "error",
        message: explain("Couldn't empty the gallery.", err),
      });
    } finally {
      setBusy(null);
    }
  };

  const working = jobs.some((j) => j.state === "sending" || j.state === "waiting");

  return (
    <>
      <div className="mt-8 rounded-xl border border-foreground/15 bg-card px-4 py-4">
        <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-foreground/60">
          {photos.length === 0 ? "Showing the built-in photoshoot" : "Your gallery"}
        </p>
        <p className="mt-2 font-sans text-[13px] leading-relaxed text-foreground/70">
          {photos.length === 0 ? (
            <>
              The invitation is showing the {GALLERY.length} photos that ship
              with the site. Upload anything here and your photos replace them
              entirely — the built-in set comes back the moment the gallery is
              empty again.
            </>
          ) : (
            <>
              {photos.length} {photos.length === 1 ? "photo" : "photos"}, shown
              in this order. The order is the{" "}
              <span className="text-foreground">Gallery</span> tab&rsquo;s row
              order — drag rows there to rearrange them.
            </>
          )}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => picker.current?.click()}
            disabled={working}
            className="rounded-full bg-foreground px-5 py-2.5 font-sans text-[11px] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {working ? "Uploading…" : "Upload photos"}
          </button>

          {photos.length === 0 && (
            <button
              type="button"
              onClick={seed}
              disabled={seeding || working}
              className="rounded-full border border-foreground/25 px-5 py-2.5 font-sans text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
            >
              {seeding ? "Copying…" : "Start from the built-in photos"}
            </button>
          )}

          {photos.length > 0 && (
            <button
              type="button"
              onClick={clear}
              disabled={busy === "all" || working}
              className="rounded-full px-5 py-2.5 font-sans text-[11px] uppercase tracking-[0.16em] text-foreground/45 transition-colors hover:text-foreground disabled:opacity-40"
            >
              {busy === "all" ? "Emptying…" : "Empty the gallery"}
            </button>
          )}
        </div>

        <input
          ref={picker}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => upload(e.target.files)}
        />
      </div>

      {jobs.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {jobs.map((job, i) => (
            <li
              key={`${job.name}-${i}`}
              className="flex items-center justify-between gap-3 font-sans text-[12px] text-foreground/60"
            >
              <span className="min-w-0 truncate">{job.name}</span>
              <span
                className={`shrink-0 uppercase tracking-[0.14em] text-[10px] ${
                  job.state === "failed"
                    ? "text-foreground"
                    : job.state === "done"
                      ? "text-foreground/45"
                      : "text-foreground/70"
                }`}
              >
                {job.state === "waiting" && "Waiting"}
                {job.state === "sending" && "Sending…"}
                {job.state === "done" && "Added"}
                {job.state === "failed" && "Failed"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {load.state === "error" && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-foreground/20 bg-foreground/5 px-5 py-4 font-sans text-[14px] leading-relaxed"
        >
          {load.message}
        </p>
      )}

      {load.state === "loading" && photos.length === 0 && (
        <p className="mt-10 font-sans text-[14px] text-foreground/60">
          Loading the gallery…
        </p>
      )}

      <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 md:gap-3">
        {photos.map((photo) => (
          <li
            key={photo.id}
            className="group relative overflow-hidden rounded-lg border border-foreground/15 bg-card"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumb}
              alt={photo.label}
              loading="lazy"
              decoding="async"
              className="block aspect-square w-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(photo)}
              disabled={busy === photo.id}
              aria-label={`Remove ${photo.label}`}
              className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full border border-background/40 bg-foreground/70 text-[15px] leading-none text-background backdrop-blur-sm transition-opacity hover:bg-foreground disabled:opacity-40"
            >
              {busy === photo.id ? "·" : "×"}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
