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
export const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbwTJlNeZIUDLLkIteJrhSeiRsQyda3p2xHztMb4HPbY084EK8BLClKedD_tkexZk_6j/exec";

export const hasEndpoint = () => RSVP_ENDPOINT.trim().length > 0;

/**
 * Where the site is published, without a trailing slash.
 *
 * The dashboard builds invitation links against this, so it has to be the
 * address guests will actually open — not wherever the dashboard happens to
 * be running. Override with NEXT_PUBLIC_SITE_URL to move the site.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://denisandmiaarrforever.site"
).replace(/\/+$/, "");

/** One reply, as the dashboard reads it back from the sheet. */
export type RsvpEntry = {
  /**
   * Which row of the sheet this came from, so it can be deleted.
   *
   * A reply has no id of its own — the form never gave it one — and older
   * replies predate this field entirely, so it may be missing. The script
   * falls back to finding the row by name and timestamp when it is.
   */
  row?: number;
  timestamp: string;
  name: string;
  /** "yes" | "no" as written by the form. */
  attending: string;
  message: string;
};
