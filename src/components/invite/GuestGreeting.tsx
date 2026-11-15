"use client";

import { useGuest } from "./InviteProvider";

/**
 * The personal line at the top of a personal invitation.
 *
 * **No design exists for this yet.** It is a placeholder that proves the name
 * arrives and sits somewhere sensible until the couple decides what the
 * personalised invitation should actually look like. Everything a redesign
 * needs is in `useGuest()` — drop this component, keep the hook.
 *
 * It renders nothing at all unless a guest has been recognised, so the
 * ordinary public invitation is untouched.
 */
export function GuestGreeting() {
  const { state, name } = useGuest();
  if (state !== "welcome" || !name) return null;

  return (
    <p className="font-doulaise text-foreground text-[28px] md:text-[34px] leading-none mb-6 md:mb-8">
      Dear {name},
    </p>
  );
}
