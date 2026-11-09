# Denis & Mia — Wedding Invitation

Wedding invitation site for **Denis S. Taniajura** and **Mia Arr D.L. Santos**,
Tuesday **15 December 2026**.

A Next.js 15 + Tailwind CSS v4 port of the "Mother of Pearl" invitation design
(originally a Vite/React single-page app), wired to Denis & Mia's details.

| | |
| --- | --- |
| Ceremony | 2:00 PM — St. Joseph the Worker Parish, San Jose del Monte, Bulacan |
| Reception | TBA — The Grounds Events Place, San Jose del Monte, Bulacan |

**Live:** https://ericreforma.github.io/denismiawedding/

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000/denismiawedding
```

The bare root redirects to the base path in development. See `next.config.mjs`.

## Still needed

`src/data/wedding.ts` carries a `TODO` on every detail the couple has not
supplied yet. Edit that one file — no component needs touching.

- **Reception start time** — the timeline and venue card both show `TBA`
- **The rest of the day's schedule** — only the 2:00 PM ceremony is confirmed,
  so the timeline has two entries where the design expects five or so
- **Dress code for general guests** — the framed card is still the
  template's "Formal Attire". The couple's own boards cover the entourage
  and the sponsors only; the colour motif is beige and navy blue if guests
  should be pointed at it.
- **Transportation** — no arrangements confirmed; the copy says details follow
- **Where to stay** — one placeholder card, no hotels chosen
- **Gift details** — the copy asks for a monetary gift without naming an
  account. Add a `detail` line to `GIFT` and render it if that changes.
- **RSVP deadline** — set to 15 November 2026
- **Full venue addresses**

Two pieces of artwork are still the template's and do not depict the real
venues: `venue-illustration.webp` (an Italianate villa) and the hotel frame.

The opening clips still show the template couple's **"C & J"** wax seal, which
cannot be re-lettered the way the still seals were. Replacing it needs new
footage. See **Interaction notes**.

## Stack

- **Next.js 15** (App Router, TypeScript), static export
- **Tailwind CSS v4** — theme in CSS via `@theme inline`, no JS config file
- **next/font** — Cormorant Garamond and Jost from Google; Monsieur La Doulaise
  self-hosted from `src/fonts`
- No animation library: scroll reveals are an IntersectionObserver plus a CSS
  transition (`useReveal` + the `.reveal` class), which keeps the bundle at
  ~112 kB first load

## Structure

```
src/
  app/
    layout.tsx     fonts, metadata, favicon
    page.tsx       section composition, enter screen, music wiring
    globals.css    tokens, fonts, noise texture, reveal transition
    icon.svg
  components/      one component per section, plus Reveal / OutlineButton
  hooks/
    useCountdown.ts        ticks to the wedding date
    useBackgroundMusic.ts  one shared looping <audio>
    useReveal.ts           adds .is-visible as sections scroll in
  data/
    wedding.ts     all copy and asset paths
  fonts/           Monsieur La Doulaise (not on Google Fonts)
public/
  art/             the design's illustrated frames, seals and textures
  photos/          the couple's photo cropped for the oval, and the
                   two dress-code boards
  audio/           looping background track
  intro/           the opening clips and their poster frame (2.9MB)
```

## Design tokens

Colours are HSL triplets on `:root` (no `hsl()` wrapper) so Tailwind can slot an
alpha in — `text-foreground/70` resolves to `hsl(var(--foreground) / 0.7)`.

| Token | Value | |
| --- | --- | --- |
| `--background` | `30 21% 96%` | warm ivory |
| `--foreground` | `212 22% 38%` | slate blue |
| `--card` | `30 21% 89%` | |
| `--border` | `30 14% 80%` | |

`body` carries a fractal-noise SVG at `background-blend-mode: overlay`, so flat
ivory areas read as paper rather than a flat fill.

Fonts: `font-display` / `font-body` (Cormorant Garamond), `font-doulaise` and
`font-ballet` (both Monsieur La Doulaise, as in the original), `font-helvetica`
and `font-sans` (Jost).

## Interaction notes

- **Opening sequence.** A still of the sealed envelope, then on tap two clips
  back to back: `intro/envelope.mp4` (4.0s, the envelope opening) and
  `intro/bridge.mp4` (6.0s, the ribboned invitation being unwrapped), then a 2s
  fade to the hero — about 12s end to end. The poster hides as soon as the first
  clip has a frame of its own; the first clip warms by `brightness(1.1)
  saturate(0.97)` over its last 1.2s; the hero text starts fading in 1.8s before
  the second clip ends, so the two overlap rather than cut. Both are muted and
  `playsInline` so mobile runs them inline. The tap also starts the music —
  browsers refuse `audio.play()` without a gesture.

  These are the original's own clips, re-encoded. They shipped at 37 Mbps and
  20 Mbps — 34MB together — which made the intro unusable: GitHub Pages serves
  this site at roughly 40–200 KB/s, so a visitor sat on the poster for minutes
  while nothing played. At libx264 CRF 26 they are **2.6MB together**, 13x
  smaller and visually indistinguishable from the source (mean per-channel
  difference 1.3/255). Re-encode with:

  ```bash
  ffmpeg -i src.mp4 -an -c:v libx264 -crf 26 -preset slow          -pix_fmt yuv420p -movflags +faststart out.mp4
  ```

  `-movflags +faststart` matters: it puts the moov atom at the front so the
  clip can start playing before it has fully downloaded.

  Two guards exist because a guest who taps and gets nothing assumes the site
  is broken, and over a slow link there are two separate ways that happens.

  **Before hydration.** The overlay is server-rendered, so the markup is on
  screen well before the ~112kB of JS has arrived. "Tap to open" is therefore
  withheld until a `useEffect` confirms the client has hydrated — otherwise
  the invitation invites a tap seconds before anything is listening.

  **Before the clips buffer.** Even at 2.6MB they can still be loading; one
  measurement from Manila needed ~110s for both to report ready. The tap
  starts a 2.5s grace timer, and if the first clip has not produced a frame
  by then the intro is skipped straight to the invitation. The timer is
  cleared as soon as a frame arrives, so a warm load is unaffected.

  One thing that cannot be fixed by re-encoding: the wax seal in the envelope
  clip carries the template couple's monogram and reads **"C & J"**. The two
  still seals were re-lettered to D & M; video frames cannot be. Replacing it
  needs new footage.

- **Our Love Story.** The couple's own words, between the scratch panel and
  the location. The design had no story section, so this one is built from its
  existing language: script heading, display-serif lead and closing, body in
  Jost, and pearl rules between movements. The proposal line is pulled out of
  the prose but set in the serif rather than the script — Monsieur La Doulaise
  turns "YES." into an unreadable tangle of capitals and detaches the
  apostrophe in "Mia’s".
- **Dress-code boards.** The couple's two finished graphics (entourage, and
  ninong & ninang) sit below the framed card and open full screen. The
  enlarge step is not decoration: fitted to a phone, a landscape board's role
  labels are a few pixels tall. In the overlay the image is sized by viewport
  height on small screens so it is wider than the phone and the wrapper pans
  sideways — about 1040px against a 390px screen, versus 358px if it were
  simply fitted. From `md` up it fits whole.
- **Scratch to reveal.** The couple's photo sits under a canvas painted with a
  paper texture and a script prompt. Pointer strokes erase it with
  `destination-out`; once a sampled 55% of pixels are clear the canvas fades.
  The paint is skipped if the visitor already started scratching, otherwise a
  late image load would wipe their progress.
- **The Day.** The drapery is a `border-image` whose top and bottom slices are
  fixed heights (up to 985px + 538px). The section carries a `min-height` that
  clears both, because with a short timeline the stretchable middle collapses
  and the two halves meet in a visible seam.
- **RSVP.** The envelope opens, then the form unfolds 700ms later. A hidden
  `website` field catches bots.

  Seating is by named guest, so the form asks only for a name, attendance, one
  dietary note and a message. The template's +1 radio and children stepper are
  gone: keeping controls whose only purpose is to add guests, directly beneath
  a note asking guests not to, would have been a contradiction.

## Photos and artwork

The couple's camera originals (~6MB each) live outside this repo. The design's
artwork came as PNG-24 with alpha; re-encoding to WebP took it from 18.9MB to
1.9MB with no visible loss.

Both wax seals originally carried the template couple's monogram. They were
re-lettered to **D & M**: the old initials were blurred out of the pearl and new
ones composited with a bevel. The seals render at ~130px, so the blur is
invisible at display size.

## Deploying

### If CI fails with `Cannot read properties of null (reading '1')`

That is `next/font`'s Google loader, and it almost always means the runner
could not reach Google Fonts for a moment — the loader reports a failed fetch
as a null dereference rather than as a network error, so the message names
nothing useful. **Re-run the job**; it builds clean on a retry.

It can also be a real fault, and the two look identical: asking for a
weight/style combination Google does not serve throws exactly the same error.
If a re-run fails the same way and the fonts in `layout.tsx` were just
changed, suspect the axis before the network — Cormorant Garamond, for one,
has italic at 400 only.

Reproduce either locally with a clean clone, since a warm `next/font` cache
hides both:

```bash
git clone <repo> /tmp/cicheck && cd /tmp/cicheck && npm ci && npm run build
```


Pushes to `main` build and publish to GitHub Pages via
`.github/workflows/deploy.yml`. Requires **Settings → Pages → Source → "GitHub
Actions"** once.

`basePath` is `/denismiawedding`. It prefixes the URLs Next generates itself but
not hand-written `<img src="/…">` paths, so those prefix themselves from
`NEXT_PUBLIC_BASE_PATH` in `wedding.ts`. Set `NEXT_PUBLIC_SITE_URL` for a custom
domain.

## RSVP and the dashboard

Replies go to a Google Sheet through an Apps Script web app — the invitation
is a static export, so it has nowhere of its own to store one.
**`docs/rsvp-setup.md`** has the sheet layout, the script to paste, and how to
publish it.

Paste the `/exec` URL into `src/data/config.ts` (or set
`NEXT_PUBLIC_RSVP_ENDPOINT` at build time). Left empty, nothing breaks: the
form thanks the guest without sending anything and the dashboard says it is
not connected yet.

`/denismiawedding/dashboard` reads the replies back — four summary tiles,
search, filter, sort, and a CSV export of whatever is on screen. It is
unlinked and `noindex`, and gated by a passcode that is checked **inside the
Apps Script**, never in the page, so reading the page source gets an attacker
nothing.

The sheet columns are exactly the form's fields: Timestamp, Name, Attending,
Dietary requirements, Message.
