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
const SCRIPT_VERSION = 6;

// CHANGE THIS. It is the only thing standing between a public URL and the
// guest list. It never appears in the website's code — the dashboard asks the
// couple to type it and sends it here to be checked.
const DASHBOARD_PASSCODE = "change-me";

const RSVP_SHEET = "RSVPs";
const INVITE_SHEET = "Invites";
const GALLERY_SHEET = "Gallery";
const ENTOURAGE_SHEET = "Entourage";
const GALLERY_FOLDER = "Denis & Mia — Gallery";
const RSVP_HEADERS = ["Timestamp", "Name", "Attending", "Message"];
const GALLERY_HEADERS = [
  "ID",
  "Label",
  "Thumb URL",
  "Full URL",
  "Width",
  "Height",
  "File ID",
  "Added",
];
const ENTOURAGE_HEADERS = [
  "Section",
  "Title",
  "Line",
  "Item",
  "Names",
  "Order",
];
const INVITE_HEADERS = [
  "Token",
  "Name",
  "Device ID",
  "Device",
  "First opened",
  "Last opened",
  "Opens",
  "Created",
  "Entourage",
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
    if (action.indexOf("gallery.") === 0) {
      return json(galleryAction(action, data));
    }
    if (action.indexOf("entourage.") === 0) {
      return json(entourageAction(action, data));
    }
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

/**
 * Add the Entourage header to an Invites tab made before that column existed.
 *
 * `getSheet` only writes headers for a tab it created itself, so a sheet from
 * an earlier version keeps its eight. The rows would still work — the script
 * writes and reads column I by position either way — but the couple would be
 * looking at an unlabelled column of Yes and No.
 */
function ensureInviteColumns(sheet) {
  if (String(sheet.getRange(1, 9).getValue() || "").trim()) return;
  sheet.getRange(1, 9).setValue("Entourage");
}

/**
 * Whether an invitation shows the entourage.
 *
 * Blank means yes. Every invitation made before this column existed has a
 * blank there, and those links were sent showing the entourage — so blank has
 * to keep meaning what it meant, or a guest who was shown the wedding party
 * last week would find it gone this week. New invitations always write an
 * explicit Yes or No, so the ambiguity never spreads.
 */
function readEntourage(v) {
  const s = String(v == null ? "" : v).trim().toLowerCase();
  if (!s) return true;
  return s !== "no" && s !== "false";
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

  ensureInviteColumns(sheet);
  const rows = sheet.getRange(2, 1, last - 1, 9).getValues();
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
      entourage: readEntourage(rows[i][8]),
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
  // Which of the two invitations this guest was sent to.
  const entourage = readEntourage(sheet.getRange(row, 9).getValue());
  const now = new Date();

  if (!known) {
    sheet.getRange(row, 3, 1, 5).setValues([
      [deviceId, String(data.device || "").trim().slice(0, 200), now, now, 1],
    ]);
    return {
      ok: true, status: "ok", name: name, entourage: entourage, firstOpen: true,
    };
  }

  if (known !== deviceId) return { ok: true, status: "blocked" };

  const opens = Number(sheet.getRange(row, 7).getValue() || 0) + 1;
  sheet.getRange(row, 6).setValue(now);
  sheet.getRange(row, 7).setValue(opens);
  return {
    ok: true, status: "ok", name: name, entourage: entourage, firstOpen: false,
  };
}

/** Everything the dashboard does to invitations. All of it passcode-gated. */
function inviteAction(action, data) {
  if (action === "invite.claim") return claimInvite(data);

  if (String(data.key || "") !== DASHBOARD_PASSCODE) {
    return { ok: false, error: "unauthorized" };
  }

  const sheet = getSheet(INVITE_SHEET, INVITE_HEADERS);
  ensureInviteColumns(sheet);

  if (action === "invite.create") {
    const name = String(data.name || "").trim().slice(0, 100);
    if (!name) return { ok: false, error: "Name is required" };
    const token = newToken();
    const entourage = data.entourage === true;
    sheet.appendRow([
      token, name, "", "", "", "", 0, new Date(), entourage ? "Yes" : "No",
    ]);
    return { ok: true, token: token, name: name, entourage: entourage };
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

  // Switch an invitation between the two versions without reissuing it. The
  // link and its device are untouched, so a guest already holding it simply
  // sees the other version next time they open it.
  if (action === "invite.entourage") {
    const entourage = data.entourage === true;
    sheet.getRange(row, 9).setValue(entourage ? "Yes" : "No");
    return { ok: true, token: token, entourage: entourage };
  }

  if (action === "invite.delete") {
    sheet.deleteRow(row);
    return { ok: true, token: token };
  }

  return { ok: false, error: "Unknown action: " + action };
}

// -------------------------------------------------------------- the gallery

/**
 * The Drive folder the uploads live in, made on first use.
 *
 * Photos are too big for a spreadsheet cell, so the sheet holds a row per
 * photo and Drive holds the file. Everything about a photo except its bytes
 * is in the row, which is why removing one is a row delete and a trash.
 */
function galleryFolder() {
  const found = DriveApp.getFoldersByName(GALLERY_FOLDER);
  return found.hasNext() ? found.next() : DriveApp.createFolder(GALLERY_FOLDER);
}

/**
 * Google will resize a public Drive image for you if you ask in the URL, so
 * one upload serves both the strip and the lightbox. `=w900` and `=w1920`
 * are the two the site asks for.
 */
function driveUrl(id, width) {
  return "https://lh3.googleusercontent.com/d/" + id + "=w" + width;
}

/** Every photo, in sheet order — which is the order the strip shows them. */
function allPhotos() {
  const sheet = getSheet(GALLERY_SHEET, GALLERY_HEADERS);
  const last = sheet.getLastRow();
  if (last < 2) return [];

  const rows = sheet.getRange(2, 1, last - 1, 8).getValues();
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    const id = String(rows[i][0] || "").trim();
    const thumb = String(rows[i][2] || "").trim();
    if (!id || !thumb) continue;
    out.push({
      id: id,
      label: String(rows[i][1] || ""),
      thumb: thumb,
      full: String(rows[i][3] || "").trim() || thumb,
      w: Number(rows[i][4] || 0) || 1000,
      h: Number(rows[i][5] || 0) || 667,
    });
  }
  return out;
}

function galleryRow(sheet, id) {
  const last = sheet.getLastRow();
  if (last < 2) return -1;
  const col = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < col.length; i++) {
    if (String(col[i][0] || "").trim() === id) return i + 2;
  }
  return -1;
}

/** Everything the dashboard does to the gallery. All of it passcode-gated. */
function galleryAction(action, data) {
  if (String(data.key || "") !== DASHBOARD_PASSCODE) {
    return { ok: false, error: "unauthorized" };
  }

  const sheet = getSheet(GALLERY_SHEET, GALLERY_HEADERS);

  // One photo, already resized by the browser that sent it.
  if (action === "gallery.add") {
    const b64 = String(data.image || "");
    if (!b64) return { ok: false, error: "No image" };

    const label = String(data.label || "photo").trim().slice(0, 120);
    const type = String(data.type || "image/jpeg");
    const blob = Utilities.newBlob(
      Utilities.base64Decode(b64),
      type,
      label || "photo",
    );

    const file = galleryFolder().createFile(blob);
    // Hotlinked by every guest's browser, so it has to be readable without
    // a Google account.
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileId = file.getId();

    const id = newToken();
    sheet.appendRow([
      id,
      label,
      driveUrl(fileId, 900),
      driveUrl(fileId, 1920),
      Number(data.w || 0) || 1000,
      Number(data.h || 0) || 667,
      fileId,
      new Date(),
    ]);
    return {
      ok: true,
      photo: {
        id: id,
        label: label,
        thumb: driveUrl(fileId, 900),
        full: driveUrl(fileId, 1920),
        w: Number(data.w || 0) || 1000,
        h: Number(data.h || 0) || 667,
      },
    };
  }

  if (action === "gallery.remove") {
    const id = String(data.id || "").trim();
    const row = galleryRow(sheet, id);
    if (row < 0) return { ok: false, error: "No such photo" };

    const fileId = String(sheet.getRange(row, 7).getValue() || "").trim();
    sheet.deleteRow(row);
    // A seeded photo has no file of its own — it is one of the built-in ones.
    if (fileId) {
      try {
        DriveApp.getFileById(fileId).setTrashed(true);
      } catch (err) {
        // The row is already gone, which is what the dashboard asked for.
      }
    }
    return { ok: true, id: id };
  }

  /**
   * Copy the built-in photoshoot into the sheet so its photos can be removed
   * and reordered one by one like any other. They keep pointing at the files
   * the site already ships; nothing is uploaded.
   */
  if (action === "gallery.seed") {
    const photos = data.photos;
    if (!photos || !photos.length) return { ok: false, error: "No photos" };
    if (sheet.getLastRow() > 1) {
      return { ok: false, error: "The gallery already has photos" };
    }
    const now = new Date();
    const rows = photos.map(function (p) {
      return [
        newToken(),
        String(p.label || ""),
        String(p.thumb || ""),
        String(p.full || ""),
        Number(p.w || 0) || 1000,
        Number(p.h || 0) || 667,
        "",
        now,
      ];
    });
    sheet.getRange(2, 1, rows.length, 8).setValues(rows);
    return { ok: true, added: rows.length };
  }

  // Back to the built-in photoshoot. Uploaded files go to Drive's bin, where
  // they can be recovered for 30 days if this was a mistake.
  if (action === "gallery.clear") {
    const last = sheet.getLastRow();
    if (last < 2) return { ok: true, removed: 0 };
    const ids = sheet.getRange(2, 7, last - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      const fileId = String(ids[i][0] || "").trim();
      if (!fileId) continue;
      try {
        DriveApp.getFileById(fileId).setTrashed(true);
      } catch (err) {
        // Already gone; the row goes regardless.
      }
    }
    sheet.deleteRows(2, last - 1);
    return { ok: true, removed: last - 1 };
  }

  return { ok: false, error: "Unknown action: " + action };
}

// ------------------------------------------------------------- the entourage

/**
 * The wedding party, when the couple have edited it.
 *
 * One row per group — "Ninongs", "Bridesmaids", a secondary sponsor's line —
 * with the names in a single cell, one per line. Flat rows rather than one
 * blob of JSON so the tab is still something a person can read and fix by
 * hand if they ever need to.
 *
 * **An empty tab means the list built into the site.** Nothing here changes
 * the invitation until the couple save something, and clearing it puts the
 * original back.
 */
function allEntourage() {
  const sheet = getSheet(ENTOURAGE_SHEET, ENTOURAGE_HEADERS);
  const last = sheet.getLastRow();
  if (last < 2) return [];

  const rows = sheet.getRange(2, 1, last - 1, 6).getValues();
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    const section = String(rows[i][0] || "").trim();
    if (!section) continue;
    out.push({
      section: section,
      title: String(rows[i][1] || ""),
      line: String(rows[i][2] || ""),
      item: String(rows[i][3] || ""),
      // One name per line in the cell; blank lines are the couple's typing.
      names: String(rows[i][4] || "")
        .split("
")
        .map(function (n) { return n.trim(); })
        .filter(function (n) { return n.length > 0; }),
      order: Number(rows[i][5] || 0),
    });
  }
  out.sort(function (a, b) { return a.order - b.order; });
  return out;
}

/** Everything the dashboard does to the entourage. All of it passcode-gated. */
function entourageAction(action, data) {
  if (String(data.key || "") !== DASHBOARD_PASSCODE) {
    return { ok: false, error: "unauthorized" };
  }

  const sheet = getSheet(ENTOURAGE_SHEET, ENTOURAGE_HEADERS);
  const last = sheet.getLastRow();

  // Back to the list built into the site.
  if (action === "entourage.clear") {
    if (last > 1) sheet.deleteRows(2, last - 1);
    return { ok: true, rows: 0 };
  }

  // The whole list arrives at once and replaces the whole tab. Editing in
  // place would need every row to carry an id and would leave the tab in a
  // half-saved state if one write failed; a wedding party is small enough
  // that rewriting it is both simpler and atomic.
  if (action === "entourage.save") {
    const groups = data.groups;
    if (!groups || !groups.length) return { ok: false, error: "Nothing to save" };

    const rows = [];
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      const names = (g.names || []).map(function (n) {
        return String(n || "").trim();
      }).filter(function (n) { return n.length > 0; });
      rows.push([
        String(g.section || "").trim(),
        String(g.title || "").trim(),
        String(g.line || "").trim(),
        String(g.item || "").trim(),
        names.join("
"),
        i,
      ]);
    }

    if (last > 1) sheet.deleteRows(2, last - 1);
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
    return { ok: true, rows: rows.length };
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

  // Public for the same reason the gallery is: every guest's browser needs
  // it, and it is the wedding party the invitation was going to show them.
  if (String(p.board || "") === "entourage") {
    try {
      return json({ ok: true, groups: allEntourage() });
    } catch (err) {
      return json({ ok: false, error: String(err) });
    }
  }

  // Public on purpose: every guest's browser needs the photo list, and it
  // is a list of pictures the invitation was going to show them anyway.
  if (String(p.board || "") === "gallery") {
    try {
      return json({ ok: true, photos: allPhotos() });
    } catch (err) {
      return json({ ok: false, error: String(err) });
    }
  }

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

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Token | Name | Device ID | Device | First opened | Last opened | Opens | Created | Entourage |

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

### Two versions, one per guest

Column I decides whether that guest's invitation lists the wedding party.
**Include the entourage** in the dashboard writes `Yes`; leaving it unticked
writes `No`. Each card also has **ADD ENTOURAGE** / **DROP ENTOURAGE**, which
flips column I without touching the link or the device holding it — so a guest
already carrying the link simply sees the other version next time.

**A blank cell means Yes.** Every invitation made before this column existed
has one, and those links were sent showing the entourage; blank has to keep
meaning what it meant, or a guest shown the wedding party last week would find
it gone this week. New invitations always write an explicit `Yes` or `No`.

The header appears on its own: `ensureInviteColumns` writes `Entourage` into
I1 the first time version 5 touches an older sheet, because `getSheet` only
writes headers for a tab it created itself. Nothing else to do by hand.

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

## The gallery

The **Gallery** tab of the dashboard uploads and removes the strip's photos.

**An empty gallery means the built-in photoshoot.** Until something is
uploaded the site shows the 123 photos that ship with it, exactly as it
always has — and emptying the gallery puts them back.

A third tab appears on first use:

`Gallery`:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| ID | Label | Thumb URL | Full URL | Width | Height | File ID | Added |

**Row order is the order on the site.** To rearrange the strip, drag rows in
this tab.

### Where the photos go

Uploads land in a Drive folder called **Denis & Mia — Gallery**, shared
*anyone with the link can view* — they have to be, because every guest's
browser loads them directly. The sheet keeps the row; Drive keeps the file.

The browser shrinks each photo to 1920px on its long edge before sending it,
which takes a phone's 3–8MB original down to a few hundred kilobytes. That is
not only for the upload: it is what the lightbox shows, and 1920px is more
than any guest's screen can use. Drawing through a canvas to do it also drops
the EXIF block, so the **GPS coordinates a phone writes into every photo do
not go public** with it.

One upload serves both sizes: Google resizes a public Drive image on request,
so the strip asks for `=w900` and the lightbox for `=w1920`.

### Start from the built-in photos

With the gallery empty, **Start from the built-in photos** copies all 123 into
the tab so they can be removed and reordered one at a time. Nothing is
uploaded — the rows point at the files the site already ships, so they stay
fast.

### Removing

The **×** on a photo removes the row and sends an uploaded file to Drive's
bin, where Google keeps it for 30 days. **Empty the gallery** does the same
for all of them and returns the site to the built-in set.

### Two things worth knowing

**Drive sharing has to be allowed.** On a Workspace account whose admin has
turned off link sharing outside the organisation, `setSharing` fails and the
photos load for you but for nobody else. The same personal `@gmail.com`
account that fixes `Anyone` deployments fixes this.

**Drive is not a CDN.** These photos come from Google rather than from the
site's own domain, so a large uploaded gallery feels slower than the baked-in
one. For a set of favourites it is not noticeable; for 300 photos it would be.

## The entourage

The dashboard's **Entourage** tab edits the wedding party — the names the
couple will change most, and the ones that used to need a developer.

**An empty tab means the list built into the site.** Nothing changes until
they save, and **Back to the original list** empties it again.

A fourth tab appears on first use:

`Entourage`:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Section | Title | Line | Item | Names | Order |

One row per block, in the order guests read them. `Section` is which part of
the list it belongs to — `couple`, `parents`, `principalSponsors`,
`honorAttendants`, `weddingParty`, `secondarySponsors`, `bearers`. `Names`
holds every name in one cell, one to a line.

`Title` is for the plain groups ("Ninongs", "Bridesmaids"). `Line` and `Item`
are for the two role-shaped sections, where the heading is a line of verse and
the object carried is sometimes named. A row uses one or the other, never
both.

Flat rows rather than one blob of JSON so the tab stays something a person can
read and repair by hand. Editing it in Sheets works; the dashboard is simply
easier.

### Saving replaces the whole tab

`entourage.save` sends the entire list and rewrites every row. Editing in
place would need an id per row and could leave the tab half-saved if one write
failed. A wedding party is small enough that rewriting it is both simpler and
all-or-nothing.

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
