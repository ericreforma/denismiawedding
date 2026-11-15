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

| A | B | C | D |
|---|---|---|---|
| Timestamp | Name | Attending | Message |

Those four are exactly the RSVP form's fields. If you'd rather make the tab by
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
const SCRIPT_VERSION = 3;

// CHANGE THIS. It is the only thing standing between a public URL and the
// guest list. It never appears in the website's code — the dashboard asks the
// couple to type it and sends it here to be checked.
const DASHBOARD_PASSCODE = "change-me";

const RSVP_SHEET = "RSVPs";
const INVITE_SHEET = "Invites";
const RSVP_HEADERS = ["Timestamp", "Name", "Attending", "Message"];
const INVITE_HEADERS = [
  "Token",
  "Name",
  "Device ID",
  "Device",
  "First opened",
  "Last opened",
  "Opens",
  "Created",
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

/** Receives one reply from the invitation, or one invitation action. */
function doPost(e) {
  // Apps Script can run several executions at once, so two guests replying in
  // the same second would otherwise race for the same row.
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const data = JSON.parse(e.postData.contents);

    // Invitations share this endpoint. A reply carries no `action`, so the
    // RSVP form goes on posting exactly what it always posted.
    const action = String(data.action || "").trim();
    if (action) return json(inviteAction(action, data));

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

  const rows = sheet.getRange(2, 1, last - 1, 4).getValues();
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
      message: String(rows[i][3] || ""),
    });
  }
  return out;
}

// --------------------------------------------------------------- invites

/**
 * Characters a token is built from: no O/0 or I/l, so a token read aloud or
 * copied out of a message by hand survives the trip.
 */
const TOKEN_ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";

/** 24 characters out of 33 is ~121 bits — not something anyone guesses. */
function newToken() {
  let out = "";
  for (let i = 0; i < 24; i++) {
    out += TOKEN_ALPHABET.charAt(
      Math.floor(Math.random() * TOKEN_ALPHABET.length),
    );
  }
  return out;
}

/** Row number of a token in the Invites tab, or -1. Row 1 is the header. */
function inviteRow(sheet, token) {
  const last = sheet.getLastRow();
  if (last < 2) return -1;
  const col = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < col.length; i++) {
    if (String(col[i][0] || "").trim() === token) return i + 2;
  }
  return -1;
}

function iso(v) {
  return v instanceof Date ? v.toISOString() : String(v || "");
}

/** Every invitation, for the dashboard. */
function allInvites() {
  const sheet = getSheet(INVITE_SHEET, INVITE_HEADERS);
  const last = sheet.getLastRow();
  if (last < 2) return [];

  const rows = sheet.getRange(2, 1, last - 1, 8).getValues();
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    const token = String(rows[i][0] || "").trim();
    if (!token) continue;
    out.push({
      token: token,
      name: String(rows[i][1] || ""),
      // The raw device id never leaves the sheet; the dashboard only needs
      // to know whether one is set, and what to call it.
      claimed: Boolean(String(rows[i][2] || "").trim()),
      device: String(rows[i][3] || ""),
      firstOpened: iso(rows[i][4]),
      lastOpened: iso(rows[i][5]),
      opens: Number(rows[i][6] || 0),
      created: iso(rows[i][7]),
    });
  }
  return out;
}

/**
 * The guest's side of the link, and the only invitation action that is not
 * passcode-gated — it is the guest who calls it, by opening the link.
 *
 * First device through the door claims the invitation. After that the same
 * device is let in and any other is turned away, which is what makes a
 * forwarded link useless to whoever it was forwarded to.
 *
 * A blocked or unknown token is never told whose invitation it was.
 */
function claimInvite(data) {
  const token = String(data.token || "").trim();
  const deviceId = String(data.deviceId || "").trim().slice(0, 100);
  if (!token || !deviceId) return { ok: true, status: "unknown" };

  const sheet = getSheet(INVITE_SHEET, INVITE_HEADERS);
  const row = inviteRow(sheet, token);
  if (row < 0) return { ok: true, status: "unknown" };

  const known = String(sheet.getRange(row, 3).getValue() || "").trim();
  const name = String(sheet.getRange(row, 2).getValue() || "");
  const now = new Date();

  if (!known) {
    sheet.getRange(row, 3, 1, 5).setValues([
      [deviceId, String(data.device || "").trim().slice(0, 200), now, now, 1],
    ]);
    return { ok: true, status: "ok", name: name, firstOpen: true };
  }

  if (known !== deviceId) return { ok: true, status: "blocked" };

  const opens = Number(sheet.getRange(row, 7).getValue() || 0) + 1;
  sheet.getRange(row, 6).setValue(now);
  sheet.getRange(row, 7).setValue(opens);
  return { ok: true, status: "ok", name: name, firstOpen: false };
}

/** Everything the dashboard does to invitations. All of it passcode-gated. */
function inviteAction(action, data) {
  if (action === "invite.claim") return claimInvite(data);

  if (String(data.key || "") !== DASHBOARD_PASSCODE) {
    return { ok: false, error: "unauthorized" };
  }

  const sheet = getSheet(INVITE_SHEET, INVITE_HEADERS);

  if (action === "invite.create") {
    const name = String(data.name || "").trim().slice(0, 100);
    if (!name) return { ok: false, error: "Name is required" };
    const token = newToken();
    sheet.appendRow([token, name, "", "", "", "", 0, new Date()]);
    return { ok: true, token: token, name: name };
  }

  const token = String(data.token || "").trim();
  const row = token ? inviteRow(sheet, token) : -1;
  if (row < 0) return { ok: false, error: "No such invitation" };

  // Clearing the device frees the invitation for whoever opens it next —
  // the fix for a link opened by the wrong person first.
  if (action === "invite.reset") {
    sheet.getRange(row, 3, 1, 5).setValues([["", "", "", "", 0]]);
    return { ok: true, token: token };
  }

  if (action === "invite.delete") {
    sheet.deleteRow(row);
    return { ok: true, token: token };
  }

  return { ok: false, error: "Unknown action: " + action };
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

  if (String(p.board || "") === "invites") {
    if (String(p.key || "") !== DASHBOARD_PASSCODE) {
      return json({ ok: false, error: "unauthorized" });
    }
    try {
      return json({ ok: true, invites: allInvites() });
    } catch (err) {
      return json({ ok: false, error: String(err) });
    }
  }

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

It has two tabs: **Replies**, and **Invitations** (above).

- **Three tiles** — replies, attending, and cannot come.
- **Search** across names and messages.
- **Filter** by attending / cannot come, and **sort** by newest, oldest or name.
- **Export CSV** — what is currently on screen, filters and all, so "everyone
  attending" is a filter and a button rather than a spreadsheet formula. It is
  written with a UTF-8 BOM so Excel does not mangle accented names.
- **Refresh** re-reads the sheet; **Lock** forgets the passcode.

On a phone each reply is a card rather than a row, because the table is
unreadable at that width and a phone is where this will usually be opened.

### About the passcode

It is checked **inside the Apps Script**, not in the page. The website never
contains it, so reading the page source gets an attacker nothing — a wrong
passcode returns `unauthorized` and no data. It is remembered in
`sessionStorage` for the tab, so a refresh does not ask again, and **Lock**
clears it.

Change it by editing `DASHBOARD_PASSCODE` and redeploying (see below — editing
alone does nothing).

---

## Personal invitation links

Each guest can be sent their own link:

```
https://denisandmiaarrforever.site/?youareinvited=mfk3rbx7qp2wnh9djc4svt6e
```

The dashboard's **Invitations** tab makes them. Type a name, press *Create
link*, and the link is copied ready to paste into a message. The site reads
the token, asks the script whose invitation it is, and greets them by name.

### The token is not the name encrypted

It cannot be. The site is a static export, so any key it could decrypt with
would ship inside the JavaScript — and a name anyone can decode is a name
anyone can forge a link for. The token is a random 24-character string
instead, and the name sits beside it in the `Invites` tab. Only the script can
match one to the other.

A second tab appears on first use:

`Invites`:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Token | Name | Device ID | Device | First opened | Last opened | Opens | Created |

### The invitation is closed

The bare address opens nothing. A visitor needs a token the `Invites` tab
knows, and one that is either unclaimed or already claimed by their own
browser — a missing token, an invented one and a stranger's all meet the same
closed screen, worded to suit each case.

**This means you cannot open your own invitation without a link.** Make one
for yourselves in the Invitations tab and keep it; it behaves exactly as a
guest's does.

What the lock is honestly worth: it is JavaScript, and the invitation's words
and pictures are already in the page it downloaded. Someone who knows to open
developer tools can read them without ever passing the gate. What it does buy
is that a link cannot be casually forwarded and reused, which is the thing
worth having. Anything stronger would mean rendering the invitation on a
server, which a static site on Pages is not.

To reopen the site to everyone, set `INVITE_ONLY` to `false` in
`src/data/invite.ts` and rebuild.

### One link, one device

The first device to open a link claims it — its id goes in column C. From then
on that device is let in and any other is turned away, so forwarding the link
gives the recipient nothing. A turned-away visitor is never told whose
invitation it was.

"Device" is as honest as a browser allows: a random id kept in that browser's
`localStorage`. So it really means *this browser, on this phone, with its
storage intact*. It will be wrong sometimes:

- **In-app browsers count separately.** Opening the link inside Messenger and
  again in Chrome looks like two devices. This is the common one — expect it.
- **Private windows** never remember, so each one claims afresh.
- **Clearing site data** releases the invitation.

Every one of those ends with a real guest locked out of their own invitation,
and the cure is the same as for a link the wrong person opened first:

### Reset

In **Invitations**, each guest's card has **Reset device**. It clears columns
C–G, so the next device to open the link claims it. Send the link again
afterwards. You can also do it by hand in the sheet — clearing column C alone
is enough.

The card also shows whether the invitation has been opened at all, what the
device called itself, and when — which doubles as a quiet read on who has
actually seen the invitation.

### Deleting

**Delete** removes the row, and the link stops working for good.

## Dropping the dietary column (sheet already live)

The form once asked for a dietary note, and the sheet was five columns wide:
`Timestamp | Name | Attending | Dietary requirements | Message`. It is four
now. If your sheet already holds replies in the old layout, **delete column D
before deploying `SCRIPT_VERSION = 2`** — right-click the `Dietary
requirements` header → *Delete column*. `Message` shifts left into D, which is
where the new script both writes it and reads it from.

Deploy the new script without deleting that column and the dashboard shows
every existing reply's dietary note where its message belongs, because the
script reads the message out of column D by position. Nothing is lost — it
reads wrong until the column goes.

Check which copy is live by opening the `/exec` URL: `"version":2` is the new
one.

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
