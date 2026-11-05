# Denis & Mia — In Bloom

Wedding invitation site for **Denis S. Taniajura** and **Mia Arr D.L. Santos**,
Tuesday **December 15, 2026**.

Built on a Next.js 15 + Tailwind CSS v4 port of the "In Bloom" garden template
(originally a Vite/React single-page app) — fonts, colour tokens, layout,
animations and effects all carried over.

| | |
| --- | --- |
| Ceremony | 2:00 PM — St. Joseph the Worker Parish, San Jose del Monte, Bulacan |
| Reception | TBA — The Grounds Events Place, San Jose del Monte, Bulacan |

## Still needed

`src/data/wedding.ts` carries a `TODO` on every detail the couple has not
supplied yet:

- **Reception start time** — currently renders as `TBA`
- **Our Story** copy — placeholder text
- **Entourage** — parents, sponsors, best man, maid of honor, groomsmen, bridesmaids
- **Hashtag** — `#DenisAndMiaInBloom` is a guess from their first names
- **RSVP deadline** — set to November 15, 2026 (30 days out)
- **Full venue addresses** and the **dress code palette**

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build && npm start   # production
```

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4** — theme configured in CSS via `@theme inline`, no JS config file
- **next/font/google** — self-hosts Cormorant Garamond, Nunito Sans and Tangerine
- **sonner** — RSVP confirmation toast

## Structure

```
src/
  app/
    layout.tsx     fonts, metadata/OG tags, favicon
    page.tsx       section composition + JSON-LD (Event, FAQPage)
    globals.css    design tokens, keyframes, custom utilities
    icon.svg       favicon
  components/      one component per section
  hooks/
    useScrollY.ts    hero parallax scroll position
    useCountdown.ts  ticking countdown to the wedding date
  data/
    wedding.ts     all copy, image paths, entourage, FAQ, palette
public/assets/     every photo is the couple's own, plus the leaf overlay
```

## Photos

All photos are Denis & Mia's own. The camera originals are ~6MB each at
4528x3016 and live outside this repo (`a-8`, `a-36`, `a-53`, `a-72`, `a-97`,
`a-116`); what ships here is resized and, where it helped, cropped to frame the
couple:

| File | From | Crop | Result |
| --- | --- | --- | --- |
| `hero-a97.jpg` | a-97 | none | 2400x1599, 331KB |
| `story-a36.jpg` | a-36 | yes | 1400x1666, 290KB |
| `g-a53.jpg` | a-53 | yes | 900x1286, 141KB |
| `g-a8.jpg` | a-8 | none | 900x599, 61KB |
| `g-a116.jpg` | a-116 | yes | 900x1286, 158KB |
| `g-a72.jpg` | a-72 | none | 900x599, 62KB |

The three cropped ones are portraits with a dark out-of-focus branch across the
right edge; the crop removes it and tightens on the couple. Together these are
2.0MB instead of the 37MB the originals would have been.

To regenerate one after replacing a source, use `sharp` — see the commit that
added them for the exact extract boxes.

## Design tokens

Brand primaries are **blue `#8CC0EB`** and **beige `#FFEAD3`**. Colours are
authored in `oklch` on `:root` in `globals.css` and exposed to Tailwind through
`@theme inline`, so `bg-sky`, `text-sky-deep`, `bg-sand/45` etc. work as
utilities.

| Token | oklch | Hex | Used for |
| --- | --- | --- | --- |
| `sky` | `78.7% 0.082 244` | `#8CC0EB` | brand blue — borders, accents |
| `beige` / `background` | `94.8% 0.038 70` | `#FFEAD3` | brand beige — page ground |
| `sky-deep` | `46% 0.095 248` | `#265B8A` | headings, footer, RSVP buttons |
| `sky-tint` | `93.5% 0.032 240` | `#DCEBFA` | pale blue section bands |
| `sand` | `89% 0.055 62` | `#F6D3B6` | warm band (gallery), footer hashtag |
| `clay` | `50% 0.125 52` | `#964E18` | warm accent — kickers, script flourishes |
| `foreground` | `30% 0.035 252` | `#212F3F` | body text |
| `card` | `98.5% 0.013 74` | `#FFF9F1` | card surfaces |
| `field` | `96.5% 0.016 240` | `#EFF5FB` | RSVP input fills |

Two notes on why some tokens exist:

- **`sky-tint` is a solid colour, not `bg-sky/15`.** A transparent blue over the
  warm beige background composites to grey — the two hues are near
  complementary — so the blue bands need their own opaque colour.
- **`field` exists for the same reason.** The beige page background is too
  saturated to sit inside the near-white RSVP card; fields get a soft blue-white.

All text pairings meet WCAG AA: foreground on beige 11.6:1, `sky-deep` 6.1:1,
`muted-foreground` 5.6:1, `clay` 5.4:1, beige on the `sky-deep` footer 6.1:1.

Custom utilities: `font-script` (Tangerine 700), `font-serif-display`
(Cormorant Garamond), `leaf-divider` (the 180px gradient rule).

## Animations & effects

| Effect | Where |
| --- | --- |
| Hero parallax — `translate3d(0, scrollY * 0.35, 0) scale(1.08)` | `Hero.tsx` + `useScrollY` |
| `drift` — 9s float, +20/-15px, 8° | floating leaves |
| `drift-slow` — 13s float, -25/+20px, -10° | floating leaves |
| `fade-up` — 0.9s entrance | hero text |
| `bounce` | scroll-down arrow |
| Gallery zoom — `hover:scale-105` over 700ms | `Gallery.tsx` |
| FAQ `+` → `✕` — `group-open:rotate-45` | `Faq.tsx` |
| Radio fill — `has-[:checked]:bg-sky/40` | `Rsvp.tsx` |
| Live countdown to `2026-12-15T14:00:00+08:00` | `useCountdown` |

The countdown renders `00` on the server and hydrates to live values, which
keeps SSR and the client in agreement (same approach as the original).

## Deploying

Set `NEXT_PUBLIC_SITE_URL` to the real domain so Open Graph and canonical URLs
resolve absolutely.

## Backend

There is none yet. `Rsvp.tsx` intercepts submit, shows a success toast and
resets the form — swap `handleSubmit` for a real API call when the backend lands.
