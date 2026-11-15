"use client";

import { COUPLE } from "@/data/wedding";

/**
 * What a forwarded link shows.
 *
 * Deliberately plain, and deliberately not an accusation — the most likely
 * person reading this is the invited guest on their second device, not a
 * gatecrasher. It never says whose invitation it was, which is the whole
 * point of the lock, and it points at the one thing that actually fixes it:
 * asking the couple.
 *
 * No design has been drawn for this yet. It is built to be replaced — the
 * copy and the markup here are a holding pattern, not a decision.
 */
export function InviteBlocked() {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-background px-6 py-16 text-foreground">
      <div className="w-full max-w-md text-center">
        <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-foreground/50">
          Private Invitation
        </p>

        <h1 className="mt-5 font-doulaise text-[2.75rem] leading-none sm:text-5xl">
          {COUPLE.one.first} &amp; {COUPLE.two.first}
        </h1>

        <p className="mt-8 font-sans text-[14px] leading-relaxed text-foreground/75">
          This invitation link has already been opened on another device, and
          each one is meant for a single guest.
        </p>

        <p className="mt-4 font-sans text-[14px] leading-relaxed text-foreground/75">
          If it is yours — you may have opened it first inside a messaging app,
          or on another phone — please message {COUPLE.one.first} or{" "}
          {COUPLE.two.first} and they will reopen it for you.
        </p>
      </div>
    </main>
  );
}
