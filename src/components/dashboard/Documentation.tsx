"use client";

import { useState } from "react";

import {
  GUIDE,
  GUIDE_INTRO,
  type GuideNote,
  type GuideSection,
} from "@/data/guide";
import { SITE_URL } from "@/data/config";

/**
 * The couple's handbook, rendered from `src/data/guide.ts`.
 *
 * Sections collapse on a phone because the whole guide is long and the thing
 * they usually want is one answer, not a read-through. `printable` opens them
 * all and drops the controls, which is what `/guide` and a paper copy need.
 */
export function Documentation({ printable = false }: { printable?: boolean }) {
  const [open, setOpen] = useState<string | null>(printable ? null : GUIDE[0].id);

  return (
    <div className={printable ? "" : "mt-8"}>
      <div className="rounded-xl border border-foreground/15 bg-card px-5 py-5">
        <h2 className="font-display text-2xl leading-tight md:text-3xl">
          {GUIDE_INTRO.title}
        </h2>
        <p className="mt-3 font-sans text-[13.5px] leading-[1.75] text-foreground/75">
          {GUIDE_INTRO.blurb}
        </p>

        {!printable && (
          <p className="mt-4 font-sans text-[12px] leading-relaxed text-foreground/55">
            Prefer it on paper, or on a second phone?{" "}
            <a
              href={`${SITE_URL}/guide`}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              Open the printable version
            </a>{" "}
            — it needs no passcode.
          </p>
        )}
      </div>

      {/* A table of contents, because the answer they want is rarely first. */}
      {!printable && (
        <nav aria-label="Guide contents" className="mt-5 flex flex-wrap gap-2">
          {GUIDE.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setOpen(s.id);
                document
                  .getElementById(`guide-${s.id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="rounded-full border border-foreground/20 px-3.5 py-2 text-left font-sans text-[11px] uppercase tracking-[0.12em] text-foreground/65 transition-colors hover:bg-foreground hover:text-background"
            >
              {i + 1}. {s.title}
            </button>
          ))}
        </nav>
      )}

      <div className={printable ? "mt-10 space-y-12" : "mt-5 space-y-3"}>
        {GUIDE.map((section, i) => (
          <Section
            key={section.id}
            section={section}
            index={i + 1}
            printable={printable}
            isOpen={printable || open === section.id}
            onToggle={() => setOpen((c) => (c === section.id ? null : section.id))}
          />
        ))}
      </div>
    </div>
  );
}

function Section({
  section,
  index,
  printable,
  isOpen,
  onToggle,
}: {
  section: GuideSection;
  index: number;
  printable: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const body = (
    <div className={printable ? "mt-5" : "px-5 pb-6"}>
      <p className="font-sans text-[13.5px] leading-[1.8] text-foreground/75">
        {section.lead}
      </p>

      {section.images?.map((image) => (
        <figure key={image.src} className="mt-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            className="mx-auto block w-full max-w-[300px] rounded-lg border border-foreground/15 shadow-[0_8px_24px_-14px_hsl(var(--foreground)/0.5)]"
          />
          <figcaption className="mx-auto mt-2.5 max-w-[22rem] text-center font-sans text-[11.5px] leading-relaxed text-foreground/50">
            {image.caption}
          </figcaption>
        </figure>
      ))}

      {section.steps && (
        <ol className="mt-6 space-y-4">
          {section.steps.map((step, n) => (
            <li key={step.action} className="flex gap-3.5">
              <span
                aria-hidden
                className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground font-sans text-[11px] tabular-nums text-background"
              >
                {n + 1}
              </span>
              <div className="min-w-0">
                <p className="font-sans text-[13.5px] leading-[1.7] text-foreground">
                  {step.action}
                </p>
                {step.detail && (
                  <p className="mt-1 font-sans text-[12.5px] leading-[1.7] text-foreground/60">
                    {step.detail}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {section.notes && (
        <div className="mt-6 space-y-3">
          {section.notes.map((note) => (
            <Note key={note.title} note={note} />
          ))}
        </div>
      )}
    </div>
  );

  if (printable) {
    return (
      <section id={`guide-${section.id}`} className="break-inside-avoid">
        <h3 className="font-display text-xl leading-tight md:text-2xl">
          <span className="text-foreground/40">{index}.</span> {section.title}
        </h3>
        {body}
      </section>
    );
  }

  return (
    <section
      id={`guide-${section.id}`}
      className="overflow-hidden rounded-xl border border-foreground/15 bg-card scroll-mt-4"
    >
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex w-full items-center gap-3 px-5 py-4 text-left"
        >
          <span
            aria-hidden
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-foreground/25 font-sans text-[12px] tabular-nums text-foreground/70"
          >
            {index}
          </span>
          <span className="min-w-0 flex-1 font-display text-lg leading-tight">
            {section.title}
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
      {isOpen && body}
    </section>
  );
}

function Note({ note }: { note: GuideNote }) {
  const warn = note.tone === "warning";
  return (
    <div
      className={`rounded-lg border px-4 py-3.5 ${
        warn
          ? "border-foreground/30 bg-foreground/[0.06]"
          : "border-foreground/15 bg-foreground/[0.03]"
      }`}
    >
      <p className="font-sans text-[11px] uppercase tracking-[0.16em] text-foreground/55">
        {warn ? "Careful" : "Good to know"} · {note.title}
      </p>
      <p className="mt-1.5 font-sans text-[12.5px] leading-[1.75] text-foreground/75">
        {note.body}
      </p>
    </div>
  );
}
