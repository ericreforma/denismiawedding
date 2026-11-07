/**
 * Every piece of copy and every asset path lives here.
 * Edit this file to change the invitation; no component needs touching.
 *
 * TODO markers flag details the couple has not supplied yet.
 */

/**
 * Set by `env` in next.config.mjs. `basePath` prefixes the URLs Next generates
 * itself, but not the plain `<img src="/…">` paths below — so they prefix
 * themselves from the same single source. Empty in local dev.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const p = (path: string) => `${BASE}${path}`;

// ---------------------------------------------------------------- the couple

export const COUPLE = {
  one: { first: "Denis", full: "Denis S. Taniajura" },
  two: { first: "Mia", full: "Mia Arr D.L. Santos" },
  /** Shown on the footer seal. */
  initials: "D & M",
} as const;

// ----------------------------------------------------------------- the event

/** Tuesday, 15 December 2026, 2:00 PM Philippine time. */
export const WEDDING_DATE = new Date("2026-12-15T14:00:00+08:00");

export const EVENT = {
  /** Hero, in the template's dotted style. */
  dateDotted: "15.12.2026",
  dateLong: "15 December 2026",
  dateSentence: "December 15, 2026",
  startISO: "2026-12-15T14:00:00+08:00",
  /** TODO: confirm end time — assumed a late-evening finish. */
  endISO: "2026-12-15T22:00:00+08:00",
  /** TODO: confirm RSVP deadline. */
  rsvpBy: "November 15, 2026",
  /** Browser tab and search result. */
  pageTitle: "Denis & Mia · San Jose del Monte Wedding 2026",
} as const;

export const CEREMONY = {
  name: "St. Joseph the Worker Parish",
  /** TODO: confirm barangay / street address. */
  city: "San Jose del Monte, Bulacan",
  mapQuery: "St+Joseph+the+Worker+Parish+San+Jose+del+Monte+Bulacan",
} as const;

export const RECEPTION = {
  name: "The Grounds Events Place",
  /** TODO: confirm the branch / full address. */
  city: "San Jose del Monte, Bulacan",
  mapQuery: "The+Grounds+Events+Place+San+Jose+del+Monte+Bulacan",
} as const;

export const mapsUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${query}`;

// ------------------------------------------------------------------ location

export const LOCATION = {
  heading: "Location",
  /** TODO: the couple may want their own words here. */
  blurb:
    "We will say our vows at St. Joseph the Worker Parish, then continue the celebration a short drive away at The Grounds Events Place.",
  note: "We recommend arriving a little early to settle in before the ceremony begins.",
  venues: [
    { kicker: "Ceremony", ...CEREMONY },
    { kicker: "Reception", ...RECEPTION },
  ],
} as const;

// ------------------------------------------------------------------- the day

/**
 * TODO: only the 2:00 PM ceremony is confirmed. The couple still needs to
 * supply the reception schedule — add entries here and the timeline grows.
 */
export const TIMELINE: {
  time: string;
  meridiem?: string;
  title: string;
  detail: string;
}[] = [
  {
    time: "2:00",
    meridiem: "PM",
    title: "Ceremony",
    detail: "We say “I do” at St. Joseph the Worker Parish.",
  },
  {
    time: "TBA",
    title: "Reception",
    detail: "Dinner and dancing at The Grounds Events Place.",
  },
];

export const THE_DAY = {
  heading: ["The", "Day"],
  blurb: "A day to celebrate,\nfrom the first hello to the last dance.",
} as const;

// ----------------------------------------------------------------- dress code

/** TODO: confirm the couple's dress code. */
export const DRESS_CODE = {
  heading: "Dress Code",
  style: "Formal Attire",
  blurb:
    "We'd love for our guests to embrace the occasion with elegant evening attire.\nDress beautifully, feel comfortable,\nand come ready to celebrate\nwith us.",
} as const;

// -------------------------------------------------------------- transportation

/** TODO: the couple has not confirmed any transport arrangements. */
export const TRANSPORT = {
  heading: "Transportation",
  paragraphs: [
    "We want getting to and from the celebration to be as easy as possible.",
    "Details of any shuttle service between the church and the reception will be shared here closer to the day.",
    "Both venues have parking available on site.",
  ],
  cta: "View Reception Venue",
  mapQuery: RECEPTION.mapQuery,
} as const;

// --------------------------------------------------------------- where to stay

/** TODO: all placeholders — the couple has not chosen hotels yet. */
export const HOTELS: {
  name: string;
  stay: string;
  rate: string;
  parking: string;
  blurb: string;
  mapQuery: string;
}[] = [
  {
    name: "To be announced",
    stay: "14 – 16 December 2026",
    rate: "To be confirmed",
    parking: "To be confirmed",
    blurb:
      "We are still arranging recommended accommodation for guests travelling in. Details will appear here soon.",
    mapQuery: RECEPTION.mapQuery,
  },
];

export const STAY = {
  heading: "Where to Stay",
  blurb:
    "For those joining us from out of town, we're putting together a short list of places to stay near the venue.",
} as const;

// ---------------------------------------------------------------------- gift

/** TODO: confirm how the couple would like to receive gifts. */
export const GIFT = {
  heading: ["Wedding", "Gift"],
  lead: "Your presence\nis our greatest gift.",
  blurb:
    "Should you wish to give a gift, a contribution toward our new home together would be lovingly received.",
  detail: "Bank and e-wallet details to follow.",
  cta: "View Registry",
} as const;

// ---------------------------------------------------------------------- rsvp

export const RSVP = {
  heading: "RSVP",
  blurbPrefix:
    "Nothing would make us happier than celebrating this day surrounded by our favourite people. Please let us know whether you'll be able to join us by ",
  openLabel: "Tap to open",
  attending: [
    { value: "yes", label: "Joyfully accepts" },
    { value: "no", label: "Regretfully declines" },
  ],
  plusOne: [
    { value: "yes", label: "Yes, with pleasure" },
    { value: "no", label: "Just me" },
  ],
  maxChildren: 4,
} as const;

// -------------------------------------------------------------------- footer

export const FOOTER = {
  line: "We can't wait to celebrate with you.",
  signOff: "With love,",
} as const;

// -------------------------------------------------------------------- assets

export const ART = {
  heroFrame: p("/art/hero-frame.webp"),
  countdownFrame: p("/art/countdown-frame.webp"),
  welcomePanel: p("/art/welcome-families.webp"),
  /** Doubles as the transport card stock — one file, two uses. */
  paper: p("/art/paper-texture.webp"),
  pearlDot: p("/art/pearl-dot.webp"),
  venue: p("/art/venue-illustration.webp"),
  timelineCurtain: p("/art/timeline-curtain.webp"),
  dressFrame: p("/art/dresscode-frame.webp"),
  dressSeal: p("/art/dresscode-seal.webp"),
  dressAttire: p("/art/dresscode-attire.webp"),
  transportBg: p("/art/transport-bg.webp"),
  transportStamps: p("/art/transport-stamps.webp"),
  hotelFrame: p("/art/hotel-frame.webp"),
  giftFrame: p("/art/gift-frame.webp"),
  rsvpTopBorder: p("/art/rsvp-top-border.webp"),
  envelopeClosed: p("/art/envelope-closed.webp"),
  envelopeOpen: p("/art/envelope-open.webp"),
  footerSeal: p("/art/footer-seal.webp"),
} as const;

export const PHOTOS = {
  /** Revealed by scratching the oval in the mother-of-pearl panel. */
  coupleScratch: p("/photos/couple-scratch.webp"),
} as const;

export const AUDIO = {
  theme: p("/audio/wedding-theme.mp3"),
} as const;
