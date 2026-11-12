# RSVP setup — Google Sheet + Apps Script

The invitation is a static export on GitHub Pages, which can't store anything.
This gives it somewhere to post to, and gives the dashboard somewhere to read
from: a script that lives inside the couple's own spreadsheet, published at a
URL, running under their Google account.

Two surfaces use it:

| | |
| --- | --- |
| `/` | the RSVP form posts a reply |
| `/dashboard` | the couple reads the replies back |

**Until you finish this, the site still works.** With `RSVP_ENDPOINT` empty in
`src/data/config.ts`, the form thanks the guest without sending anything, and
the dashboard says it has not been connected yet.

---

## 1. The sheet

Make a new Google Sheet. That's all — the script creates its tab, with
headers, the first time a reply arrives.

`RSVPs`:

| A | B | C | D | E |
|---|---|---|---|---|
| Timestamp | Name | Attending | Dietary requirements | Message |

Those five are exactly the RSVP form's fields. If you'd rather make the tab by
hand, call it `RSVPs` and type the headers into row 1 — the script only writes
headers for a tab it created itself, because it can't tell an empty sheet from
one whose first row is already yours.

Capitals and stray spaces in the tab name don't matter: `rsvps`, `RSVPs ` and
`RSVPS` all resolve to the same tab, deliberately. See `getSheet` for the
silent failure that saves you from.

## 2. The script

**Extensions → Apps Script.** Delete whatever's in the editor, paste this in,
**change `DASHBOARD_PASSCODE` to something only you know**, and save.

```js
// Bumped whenever this script changes in a way a deployment has to catch up
// with. The health check prints it, so "is the deployed copy current?" stops
// being something you have to remember and becomes something the /exec URL
// tells you.
const SCRIPT_VERSION = 1;

// CHANGE THIS. It is the only thing standing between a public URL and the
// guest list. It never appears in the website's code — the dashboard asks the
// couple to type it and sends it here to be checked.
const DASHBOARD_PASSCODE = "change-me";

const RSVP_SHEET = "RSVPs";
const RSVP_HEADERS = [
  "Timestamp",
  "Name",
  "Attending",
  "Dietary requirements",
  "Message",
];

/**
 * One tab — found if you already made it, created with its headers if not.
 *
 * Looking a tab up by name and trusting it to exist is how you get
 * "Cannot read properties of null (reading 'appendRow')" from a tab that was
 * never renamed off Sheet1. The loose match removes the other half of that
 * problem, which is worse because it fails silently: `getSheetByName` is
 * exact and case-sensitive, so a tab you added by hand as "RSVPs " (with a
 * space you cannot see) is not the "RSVPs" the script asks for, and it would
 * cheerfully create a second tab beside yours and write every reply into
 * that one instead.
 */
function getSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const wanted = String(name).trim().toLowerCase();
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().trim().toLowerCase() === wanted) return sheets[i];
  }

  const sheet = ss.insertSheet(name);
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);
  return sheet;
}

/** Receives one reply from the invitation and appends it. */
function doPost(e) {
  // Apps Script can run several executions at once, so two guests replying in
  // the same second would otherwise race for the same row.
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const data = JSON.parse(e.postData.contents);

    // Honeypot: a field hidden from real users. Bots fill in everything they
    // find, so anything arriving with this set is discarded — and told it
    // succeeded, because a bot that sees a failure tries again.
    if (data.website) return json({ ok: true });

    const name = String(data.name || "").trim();
    if (!name) return json({ ok: false, error: "Name is required" });

    // The form sends "yes"/"no"; the sheet gets something a person can read.
    const attending =
      String(data.attending || "").trim().toLowerCase() === "yes" ? "Yes" : "No";

    getSheet(RSVP_SHEET, RSVP_HEADERS).appendRow([
      new Date(),
      name.slice(0, 100),
      attending,
      String(data.dietary || "").trim().slice(0, 500),
      String(data.message || "").trim().slice(0, 1000),
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Every reply, for the dashboard. */
function allEntries() {
  const sheet = getSheet(RSVP_SHEET, RSVP_HEADERS);
  const last = sheet.getLastRow();
  if (last < 2) return [];

  const rows = sheet.getRange(2, 1, last - 1, 5).getValues();
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    const name = String(rows[i][1] || "").trim();
    if (!name) continue;
    const ts = rows[i][0];
    out.push({
      // ISO so the browser can parse and re-format it in the reader's locale.
      timestamp: ts instanceof Date ? ts.toISOString() : String(ts || ""),
      name: name,
      attending: String(rows[i][2] || ""),
      dietary: String(rows[i][3] || ""),
      message: String(rows[i][4] || ""),
    });
  }
  return out;
}

/**
 * Read requests: the dashboard, and a health check.
 *
 * `?board=rsvps&key=…` returns every reply, but only to the right passcode.
 * Anything else returns the health check — visiting the /exec URL in an
 * incognito window should print it, and it deliberately reveals nothing about
 * the guest list beyond whether the tab resolved.
 */
function doGet(e) {
  const p = (e && e.parameter) || {};

  if (String(p.board || "") === "rsvps") {
    // Compared here rather than in the website, so the passcode is never in
    // anything a stranger can download.
    if (String(p.key || "") !== DASHBOARD_PASSCODE) {
      return json({ ok: false, error: "unauthorized" });
    }
    try {
      return json({ ok: true, entries: allEntries() });
    } catch (err) {
      return json({ ok: false, error: String(err) });
    }
  }

  let rsvpOk = false;
  try {
    rsvpOk = Boolean(getSheet(RSVP_SHEET, RSVP_HEADERS));
  } catch (err) {
    // Stays false, which is the thing worth reporting.
  }
  return json({
    ok: true,
    service: "rsvp",
    version: SCRIPT_VERSION,
    rsvpOk: rsvpOk,
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. Publish it

**Deploy → New deployment → Web app**, then:

- **Execute as:** `Me`
- **Who has access:** `Anyone`

Authorise it. Google will warn you it's an unverified app — it's your own
script, so continue through *Advanced → Go to (project name)*.

Copy the URL it gives you. It looks like:

```
https://script.google.com/macros/s/AKfycb…/exec
```

It must be `Anyone`, not `Anyone with Google account`. The latter redirects to
a login page that `fetch` cannot follow cross-origin, which shows up in the
browser as a CORS failure rather than as the permissions problem it is.

## 4. Wire it up

Paste that URL into `src/data/config.ts`:

```ts
export const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycb…/exec";
```

Rebuild and push. Send a test RSVP, check the row lands, open
`/dashboard`, enter the passcode, confirm the reply appears —
then delete the test row.

---

## The dashboard

`/dashboard`. It is not linked from the invitation and carries
`noindex`, so it is reachable only by someone who knows the address.

- **Four tiles** — replies, attending, cannot come, and how many left a
  dietary note.
- **Search** across names, dietary notes and messages.
- **Filter** by attending / cannot come, and **sort** by newest, oldest or name.
- **Export CSV** — what is currently on screen, filters and all, so "everyone
  attending" is a filter and a button rather than a spreadsheet formula. It is
  written with a UTF-8 BOM so Excel does not mangle accented names.
- **Refresh** re-reads the sheet; **Lock** forgets the passcode.

On a phone each reply is a card rather than a row, because a five-column table
is unreadable at that width and a phone is where this will usually be opened.

### About the passcode

It is checked **inside the Apps Script**, not in the page. The website never
contains it, so reading the page source gets an attacker nothing — a wrong
passcode returns `unauthorized` and no data. It is remembered in
`sessionStorage` for the tab, so a refresh does not ask again, and **Lock**
clears it.

Change it by editing `DASHBOARD_PASSCODE` and redeploying (see below — editing
alone does nothing).

---

## Troubleshooting

### `403 (Forbidden)` / `net::ERR_FAILED`

The deployment isn't public. The pair of errors is the giveaway: Google
returns a 403 sign-in page, and that page carries no CORS headers, so the
browser reports a network failure on top of it.

**Check it:** open the `/exec` URL in an incognito window.

| What you see | What it means |
|---|---|
| `{"ok":true,"service":"rsvp",…}` | Public and working — the problem is elsewhere |
| A Google sign-in page | Access is restricted — fix below |

**Fix:** *Deploy → Manage deployments → ✏️ → **Who has access: `Anyone`*** →
*Version: New version* → *Deploy*. The URL doesn't change.

**If `Anyone` isn't offered,** the account owning the sheet is a Workspace
account whose admin has restricted publishing outside the organisation.
Recreate the sheet under a personal `@gmail.com` account; the site doesn't
care which account it is.

### The dashboard says the passcode was not accepted

The deployed script's `DASHBOARD_PASSCODE` is not what you typed. Most often
the script was edited and saved but never redeployed — see below.

### The form posts but no row appears

You edited the script without redeploying — see below.

## Things that will bite you

**Editing the script doesn't change what's live.** After any edit you must go
to *Deploy → Manage deployments → ✏️ (pencil) → Version: **New version** →
Deploy*. If you click *New deployment* instead you get a **different URL**, and
the site keeps hitting the old code. This catches everyone exactly once.

**The `text/plain` content type in the form is deliberate.** `application/json`
would make the browser send a CORS preflight `OPTIONS` request first, and Apps
Script web apps have no way to answer one — so the real POST never happens, and
the console blames CORS rather than the header. The body is still JSON;
`JSON.parse` on the other side doesn't care what the header said.

**The endpoint is public.** The honeypot stops bots. Nothing stops a determined
person adding junk rows, which at this scale is fine — you'll be reading the
list by eye anyway. Reading is the part that's gated.

**Quotas** are generous — thousands of executions a day on a free account. A
wedding is nowhere near.
