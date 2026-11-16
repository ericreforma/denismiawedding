"use client";

import { ART, COUPLE, EVENT } from "@/data/wedding";
import { useGuest, type GuestState } from "./InviteProvider";

/**
 * What stands in for the invitation when the invitation is not for you.
 *
 * Four closed doors and a waiting room, all wearing the invitation's own
 * clothes — ivory, slate, Cormorant, the sealed envelope from the intro — so
 * that being turned away still feels like part of the wedding rather than an
 * error page. The wording never blames the reader: much the likelier story is
 * a guest on their second phone than someone who should not be here.
 *
 * It never names the guest an invitation belongs to. That is the lock.
 */
const COPY: Record<
  Exclude<GuestState, "welcome">,
  { eyebrow: string; lead: string; body: string }
> = {
  checking: {
    eyebrow: "Private Invitation",
    lead: "Opening your invitation.",
    body: "",
  },
  // Never read: the greeting puts the guest's name where the lead goes, so
  // it is built below rather than taken from here.
  greeting: { eyebrow: "Private Invitation", lead: "", body: "" },
  closed: {
    eyebrow: "By Invitation Only",
    lead: "This invitation is personal.",
    body: `Every guest receives their own link from ${COUPLE.one.first} and ${COUPLE.two.first}. Please open the one that was sent to you, and it will know you by name.`,
  },
  invalid: {
    eyebrow: "By Invitation Only",
    lead: "This link doesn't open an invitation.",
    body: "It may have been shortened, cut off, or changed on its way here. Opening the original message again is usually all it takes.",
  },
  blocked: {
    eyebrow: "By Invitation Only",
    lead: "This invitation has already been opened.",
    body: `Each link belongs to one guest, on one device. If it is yours — you may have opened it first inside a messaging app, or on another phone — message ${COUPLE.one.first} or ${COUPLE.two.first} and they will reopen it for you.`,
  },
  offline: {
    eyebrow: "One moment",
    lead: "We couldn't check your invitation.",
    body: "Something between here and the guest list did not answer. Your connection is the usual culprit — please try again.",
  },
};

export function InviteGate() {
  const { state, name, retry } = useGuest();
  if (state === "welcome") return null;

  const copy = COPY[state];
  const greeting = state === "greeting";
  const waiting = state === "checking" || greeting;

  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-background px-6 py-16 text-foreground">
      {/* The same paper the rest of the invitation is printed on. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ART.paper}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover opacity-40"
        draggable={false}
      />

      <div
        className={`relative w-full max-w-[29rem] text-center transition-opacity duration-1000 ${
          state === "checking" ? "opacity-70" : "opacity-100"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ART.envelopeClosed}
          alt=""
          aria-hidden
          className={`mx-auto w-[108px] select-none md:w-[124px] ${
            state === "checking" ? "animate-pulse" : ""
          }`}
          draggable={false}
        />

        <p className="mt-8 font-sans text-[10px] uppercase tracking-[0.34em] text-foreground/45 md:text-[11px]">
          {copy.eyebrow}
        </p>

        <h1 className="mt-4 font-doulaise text-[2.6rem] leading-[0.95] text-foreground sm:text-5xl">
          {COUPLE.one.first} &amp; {COUPLE.two.first}
        </h1>

        {/* A hairline with a diamond on it, as the printed pieces use. */}
        <div
          aria-hidden
          className="mx-auto mt-7 flex w-28 items-center justify-center gap-2"
        >
          <span className="h-px flex-1 bg-foreground/25" />
          <span className="h-1 w-1 rotate-45 bg-foreground/40" />
          <span className="h-px flex-1 bg-foreground/25" />
        </div>

        {greeting ? (
          <>
            <p className="mt-7 font-display text-[17px] leading-snug text-foreground/70 md:text-[19px]">
              Opening the invitation for
            </p>
            <p className="mt-2.5 text-balance font-display text-[1.9rem] leading-[1.2] tracking-[0.01em] text-foreground sm:text-[2.2rem]">
              {name}
            </p>
          </>
        ) : (
          <p className="mt-7 font-display text-[22px] leading-snug text-foreground md:text-[25px]">
            {copy.lead}
          </p>
        )}

        {copy.body && (
          <p className="mx-auto mt-4 max-w-[26rem] font-sans text-[13px] leading-[1.85] text-foreground/65 md:text-[13.5px]">
            {copy.body}
          </p>
        )}

        {state === "offline" && (
          <button
            type="button"
            onClick={retry}
            className="mt-8 rounded-full border border-foreground/30 px-8 py-3 font-sans text-[11px] uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Try again
          </button>
        )}

        {!waiting && (
          <p className="mt-10 font-display text-[13px] tracking-[0.3em] text-foreground/40">
            {EVENT.dateDotted}
          </p>
        )}
      </div>
    </main>
  );
}
