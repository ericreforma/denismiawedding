/**
 * Every piece of copy on the invitation lives here.
 * Edit this file to change names, dates, venues, entourage, FAQs or palette —
 * no component needs touching.
 *
 * TODO markers flag details the couple has not supplied yet.
 */

// ---------------------------------------------------------------- the couple

export const COUPLE = {
  groom: { first: "Denis", full: "Denis S. Taniajura" },
  bride: { first: "Mia", full: "Mia Arr D.L. Santos" },
  /** TODO: confirm — derived from their first names. */
  hashtag: "#DenisAndMiaInBloom",
} as const;

// ----------------------------------------------------------------- the event

/** Tuesday, December 15 2026, 2:00 PM Philippine time. */
export const WEDDING_DATE = new Date("2026-12-15T14:00:00+08:00");

export const EVENT = {
  dateLong: "December 15, 2026",
  dateStacked: "December 15 · 2026",
  /** Shown under the couple's names in the hero. */
  heroLine: "December 15 · 2026 · San Jose del Monte",
  /** ISO strings for the Event structured data. */
  startISO: "2026-12-15T14:00:00+08:00",
  /** TODO: confirm end time — assumed a late-evening finish. */
  endISO: "2026-12-15T22:00:00+08:00",
  /** TODO: confirm RSVP deadline — set to 30 days before the wedding. */
  rsvpBy: "November 15, 2026",
} as const;

export const CEREMONY = {
  kicker: "Ceremony",
  time: "2:00 PM",
  venue: "St. Joseph the Worker Parish",
  /** TODO: confirm barangay / street address. */
  location: "San Jose del Monte, Bulacan",
  mapQuery: "St+Joseph+the+Worker+Parish+San+Jose+del+Monte+Bulacan",
} as const;

export const RECEPTION = {
  kicker: "Reception",
  /** TODO: the couple has not given a reception start time yet. */
  time: "TBA",
  venue: "The Grounds Events Place",
  /** TODO: confirm the branch / full address. */
  location: "San Jose del Monte, Bulacan",
  mapQuery: "The+Grounds+Events+Place+San+Jose+del+Monte+Bulacan",
} as const;

export const mapsUrl = (query: string) => `https://maps.google.com/?q=${query}`;

// ------------------------------------------------------------------- imagery

/**
 * Set by `env` in next.config.mjs. `basePath` prefixes the URLs Next generates
 * itself, but not the plain `<img src="/…">` paths below — so they prefix
 * themselves from the same single source. Empty in local dev.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const IMAGES = {
  /** Optimized from the full-res a-97.jpg (4528x3016, 6.4MB) -> 2400x1599, 0.3MB. */
  hero: `${BASE_PATH}/assets/hero-a97.jpg`,
  story: `${BASE_PATH}/assets/story-BL62Dm0L.jpg`,
  leaves: `${BASE_PATH}/assets/leaves-D8rPBbE0.png`,
  g1: `${BASE_PATH}/assets/g1-DxwMwt42.jpg`,
  g2: `${BASE_PATH}/assets/g2-BH78IkrI.jpg`,
  g3: `${BASE_PATH}/assets/g3-DEuxgs49.jpg`,
  g4: `${BASE_PATH}/assets/g4-DzQSwQmZ.jpg`,
  g5: `${BASE_PATH}/assets/g5-BIlb7Qb4.jpg`,
  g6: `${BASE_PATH}/assets/g6-CUSko8JJ.jpg`,
} as const;

export const GALLERY: { src: string; span: string }[] = [
  { src: IMAGES.g1, span: "row-span-2" },
  { src: IMAGES.g2, span: "" },
  { src: IMAGES.g3, span: "row-span-2" },
  { src: IMAGES.g4, span: "" },
  { src: IMAGES.g5, span: "" },
  { src: IMAGES.g6, span: "" },
];

// --------------------------------------------------------------- their story

/**
 * TODO: replace with Denis & Mia's own words — how they met, the proposal,
 * whatever they'd like guests to read. Three short paragraphs fits the layout.
 */
export const STORY_PARAGRAPHS: string[] = [
  "Our story, in our own words — coming soon.",
  "We're still putting this part together. Check back before the big day.",
];

export const STORY_SIGNATURE = `— ${COUPLE.groom.first[0]} & ${COUPLE.bride.first[0]}`;

// ----------------------------------------------------------------- entourage

/**
 * TODO: all names below are placeholders. Replace with the real entourage.
 * Add or remove groups freely — the grid reflows on its own.
 */
export const ENTOURAGE: { title: string; names: string[] }[] = [
  { title: "Parents of the Groom", names: ["To be announced"] },
  { title: "Parents of the Bride", names: ["To be announced"] },
  { title: "Principal Sponsors", names: ["To be announced"] },
  { title: "Best Man & Maid of Honor", names: ["To be announced"] },
  { title: "Groomsmen", names: ["To be announced"] },
  { title: "Bridesmaids", names: ["To be announced"] },
];

// -------------------------------------------------------------- dress code

/**
 * TODO: confirm the couple's chosen palette.
 * Currently mirrors the site theme: the two brand colours plus supporting tones.
 */
export const PALETTE = ["#8CC0EB", "#B8D8F0", "#FFEAD3", "#F6D3B6", "#265B8A"];

export const ATTIRE = {
  kicker: "Dress code",
  title: "Garden Party Semi-Formal",
  intro:
    "Help us bring the garden to life. We invite you to wear soft pastels — sky blue, beige, and warm sand.",
  gentlemen: "Light linen suit or barong tagalog in beige, sand, or stone.",
  ladies:
    "Flowy dresses in soft blue or beige. Block heels or flats recommended — we'll be on grass.",
  note: "Please avoid white",
} as const;

// ----------------------------------------------------------------------- faq

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Is the ceremony outdoors?",
    a: `The ceremony is indoors at ${CEREMONY.venue}. The reception at ${RECEPTION.venue} is largely outdoors among the gardens — please dress for warm weather and grass underfoot.`,
  },
  {
    q: "What if it rains?",
    a: `${RECEPTION.venue} has covered pavilions ready as a weather contingency. Rain or shine, the celebration goes on.`,
  },
  {
    q: "Can I bring a plus-one?",
    a: "Due to limited seating, kindly RSVP only for the names indicated on your invitation. Thank you for understanding.",
  },
  {
    q: "Are children welcome?",
    a: "We adore your little ones, but this will be an adults-only celebration so you can fully relax with us.",
  },
  {
    q: "Where can I park?",
    a: "Both venues offer ample on-site parking. Carpooling is encouraged.",
  },
  {
    q: "Gift guidance?",
    a: "Your presence is the truest gift. Should you wish, a monetary gift toward our future home would be lovingly received.",
  },
];

export const ATTENDING_OPTIONS = [
  "Joyfully accepts",
  "Regretfully declines",
] as const;
