/**
 * Where the RSVP form posts and where the dashboard reads from.
 *
 * The invitation is a static export on GitHub Pages, so it has nowhere of its
 * own to store a reply. Both ends talk to one Google Apps Script web app
 * bound to the couple's spreadsheet — see `docs/rsvp-setup.md` for the script
 * and how to publish it.
 *
 * Paste the `/exec` URL here (or set NEXT_PUBLIC_RSVP_ENDPOINT at build time).
 * Left empty, the site still works: the form acknowledges the reply locally
 * and the dashboard says it has not been connected yet.
 */
export const RSVP_ENDPOINT =
  process.env.NEXT_PUBLIC_RSVP_ENDPOINT ?? "";

export const hasEndpoint = () => RSVP_ENDPOINT.trim().length > 0;

/** One reply, as the dashboard reads it back from the sheet. */
export type RsvpEntry = {
  timestamp: string;
  name: string;
  /** "yes" | "no" as written by the form. */
  attending: string;
  dietary: string;
  message: string;
};
