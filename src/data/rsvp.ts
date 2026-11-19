/**
 * Changing replies after the fact.
 *
 * Reading them is the dashboard's own business and lives in the component.
 * This is the one thing that writes: removing a reply, which the couple
 * wanted for the duplicates and test entries that a form on a public page
 * inevitably collects.
 */

import { RSVP_ENDPOINT, type RsvpEntry } from "./config";

/**
 * Delete one reply.
 *
 * The row number is a hint, not an address — a guest replying while the
 * dashboard is open shifts every row beneath them. The script checks the name
 * before deleting and looks the reply up properly if it does not match, so
 * the worst case is a failed delete rather than the wrong guest's reply
 * disappearing.
 */
export async function removeReply(key: string, entry: RsvpEntry) {
  const res = await fetch(RSVP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "rsvp.remove",
      key,
      row: entry.row,
      name: entry.name,
      timestamp: entry.timestamp,
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new Error(`Request failed (${res.status})`);
  if (!data.ok) throw new Error(data.error || "Request failed");
}
