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
- **Dress code** — currently the template's "Formal Attire"
- **Transportation** — no arrangements confirmed; the copy says details follow
- **Where to stay** — one placeholder card, no hotels chosen
- **Gift details** — bank / e-wallet details are not published yet
- **RSVP deadline** — set to 15 November 2026
- **Full venue addresses**

Two pieces of artwork are still the template's and do not depict the real
venues: `venue-illustration.webp` (an Italianate villa) and the hotel frame.

The opening animation is a rebuild rather than the original's video — see
**Interaction notes**.

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
  photos/          the couple's photo, cropped for the oval
  audio/           looping background track
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

- **Opening animation.** The invitation arrives as a sealed envelope: the wax
  seal breathes and a sheen travels across the paper. Tapping lifts the seal
  away, crossfades the flap open, then draws the whole card toward the viewer
  as it fades, revealing the hero beneath (~2.5s end to end). The tap also
  starts the music — browsers refuse `audio.play()` without a gesture.

  The original ran two MP4s here (`envelope-oct.mp4` 18.7MB + `intro-bridge.mp4`
  15.5MB = 34MB) of a real envelope opening. They are not used, for two reasons:
  the weight, and the wax seal in every frame carries the template couple's
  monogram, which cannot be re-lettered the way the still seals were. This
  rebuilds the same beat from the re-lettered seal and the two envelope stills
  at no extra download.
- **Scratch to reveal.** The couple's photo sits under a canvas painted with a
  paper texture and a script prompt. Pointer strokes erase it with
  `destination-out`; once a sampled 55% of pixels are clear the canvas fades.
  The paint is skipped if the visitor already started scratching, otherwise a
  late image load would wipe their progress.
- **The Day.** The drapery is a `border-image` whose top and bottom slices are
  fixed heights (up to 985px + 538px). The section carries a `min-height` that
  clears both, because with a short timeline the stretchable middle collapses
  and the two halves meet in a visible seam.
- **RSVP.** The envelope opens, then the form unfolds 700ms later. Guest count
  drives one dietary field per person. A hidden `website` field catches bots.

## Photos and artwork

The couple's camera originals (~6MB each) live outside this repo. The design's
artwork came as PNG-24 with alpha; re-encoding to WebP took it from 18.9MB to
1.9MB with no visible loss.

Both wax seals originally carried the template couple's monogram. They were
re-lettered to **D & M**: the old initials were blurred out of the pearl and new
ones composited with a bevel. The seals render at ~130px, so the blur is
invisible at display size.

## Deploying

Pushes to `main` build and publish to GitHub Pages via
`.github/workflows/deploy.yml`. Requires **Settings → Pages → Source → "GitHub
Actions"** once.

`basePath` is `/denismiawedding`. It prefixes the URLs Next generates itself but
not hand-written `<img src="/…">` paths, so those prefix themselves from
`NEXT_PUBLIC_BASE_PATH` in `wedding.ts`. Set `NEXT_PUBLIC_SITE_URL` for a custom
domain.

## Backend

There is none. `Rsvp.tsx` acknowledges the submission locally and shows a
thank-you panel — swap `handleSubmit` for a real call when the backend lands.
