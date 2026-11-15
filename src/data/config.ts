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
export const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbxNSUiX3X8G-vDHW9LOzWcvKZThIZE4GDv4RmAfguUwUHxj6zhPBI5ggr81pelHCQI9/exec";

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
  timestamp: string;
  name: string;
  /** "yes" | "no" as written by the form. */
  attending: string;
  message: string;
};
