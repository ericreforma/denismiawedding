/**
 * Turn a thrown error into something worth putting on screen.
 *
 * Every dashboard action used to answer failure with a fixed sentence —
 * "Couldn't upload that picture. Please try again." — which is true, useless,
 * and actively misleading when trying again will never work. An upload that
 * fails because the Apps Script was redeployed without the Drive permission
 * fails the same way forever, and the script knows that and says so; the
 * dashboard was throwing the explanation away.
 *
 * So: lead with the plain sentence the couple need, then add what the script
 * actually said, when it said anything beyond the obvious.
 */
export function explain(lead: string, err: unknown) {
  const raw = String(
    err instanceof Error ? err.message : (err ?? ""),
  ).trim();

  if (!raw || /^request failed$/i.test(raw)) return lead;

  if (/unauthorized/i.test(raw)) {
    return `${lead} The passcode was not accepted — tap Lock and sign in again.`;
  }

  if (/^drive:/i.test(raw)) {
    return (
      `${lead} Google would not let the website use your Drive, which is ` +
      `where the pictures are kept. This usually means the script needs to ` +
      `be authorised again after its last update — whoever set it up can do ` +
      `it in a minute. (${raw.slice(0, 160)})`
    );
  }

  return `${lead} (${raw.slice(0, 180)})`;
}
