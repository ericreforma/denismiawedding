"use client";

import { useState } from "react";

import { COUPLE } from "@/data/wedding";

type PasscodeGateProps = {
  onSubmit: (code: string) => void;
  error: string | null;
};

/**
 * The guest list is personal, and this page sits on a public URL.
 *
 * The passcode is never in the bundle: it is typed here, sent to the Apps
 * Script, and checked there. A wrong one gets no data back, so the gate is
 * real rather than a screen anyone can skip by reading the page source.
 */
export function PasscodeGate({ onSubmit, error }: PasscodeGateProps) {
  const [code, setCode] = useState("");

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) onSubmit(code.trim());
        }}
        className="w-full max-w-sm text-center"
      >
        <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-foreground/50">
          RSVP Dashboard
        </p>
        <h1 className="mt-3 font-doulaise text-5xl leading-none">
          {COUPLE.one.first} &amp; {COUPLE.two.first}
        </h1>

        <label className="mt-10 block text-left">
          <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-foreground/60">
            Passcode
          </span>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the dashboard passcode"
            className="mt-2 w-full rounded-lg border border-foreground/20 bg-card px-4 py-3 font-sans text-[15px] placeholder:text-foreground/35 focus:border-foreground/50 focus:outline-none"
          />
        </label>

        {error && (
          <p
            role="alert"
            className="mt-4 text-left font-sans text-[13px] leading-relaxed text-foreground/75"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!code.trim()}
          className="mt-6 w-full rounded-full bg-foreground px-6 py-3 font-sans text-[12px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          View replies
        </button>

        <p className="mt-8 font-sans text-[12px] leading-relaxed text-foreground/45">
          This page shows the guest list. Please keep the passcode private.
        </p>
      </form>
    </main>
  );
}
