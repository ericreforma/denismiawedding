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
  /** She goes by "Mia Arr", not "Mia". */
  two: { first: "Mia Arr", full: "Mia Arr D.L. Santos" },
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
  pageTitle: "Denis & Mia Arr · San Jose del Monte Wedding 2026",
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

// --------------------------------------------------------------- love story

/**
 * The couple's own words. `lead` and `closing` are set in the display serif,
 * the quote in the script face, and `before`/`after` are the body paragraphs
 * either side of it. `closing` is one line per rendered line.
 */
export const STORY = {
  heading: "Our Love Story",
  lead: "In a season of sadness, two hearts unexpectedly found happiness in each other.",
  before: [
    "It all began with simple text messages that eventually led to their first meet-up. When they finally met, neither of them fell in love right away, but there was something special—a feeling that made them want to see each other again.",
    "What they thought would be their last meeting turned into more frequent encounters, until little by little, they became fond of each other. Through sincere courtship, sweet moments, and growing affection, their hearts eventually found their way to love.",
  ],
  quote: "And then came Mia Arr’s sweetest “YES.”",
  after: [
    "Years passed, and their love continued to grow stronger. Together, they decided to take the next beautiful step—to build a family and spend forever side by side.",
    "Now, as they stand before a new beginning, Mia Arr and Denis are ready to embrace a lifetime of love, faith, and togetherness.",
  ],
  closing: [
    "From unexpected beginnings to a forever kind of love.",
    "Their greatest adventure begins here.",
  ],
} as const;

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

/**
 * TODO: the framed card is still the template's wording for general guests.
 * The couple's own boards below cover the entourage and the sponsors only, so
 * guests have no stated dress code yet beyond "formal" — the colour motif on
 * the sponsors board is beige and navy blue if they want guests pointed at it.
 */
export const DRESS_CODE = {
  heading: "Dress Code",
  style: "Formal Attire",
  blurb:
    "We'd love for our guests to embrace the occasion with elegant evening attire.\nDress beautifully, feel comfortable,\nand come ready to celebrate\nwith us.",
} as const;

/**
 * The couple's own dress-code boards. Each is a finished graphic with its own
 * heading and small print, so they are shown whole rather than picked apart —
 * and they open full screen, because the role labels are unreadable at phone
 * width.
 */
export const DRESS_BOARDS: { src: string; label: string; alt: string }[] = [
  {
    src: p("/photos/dresscode-entourage.webp"),
    label: "For the Entourage",
    alt: "Dress code for the entourage — maid of honor in navy blue, bridesmaids in beige, best man in a beige suit, and groomsmen in white long sleeves with a navy blue vest and beige tie",
  },
  {
    src: p("/photos/dresscode-sponsors.webp"),
    label: "For our Ninong & Ninang",
    alt: "Dress code for the principal sponsors — ninong in a barong, ninang in beige with a touch of navy blue. The wedding colour motif is beige and navy blue",
  },
];

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

/**
 * TODO: no bank or e-wallet details are published. The copy asks for a
 * monetary gift without saying where to send it, which is normal for a
 * Philippine wedding (guests bring an envelope) — add a `detail` line and
 * render it in WeddingGift if that changes.
 */
export const GIFT = {
  heading: ["Wedding", "Gift"],
  /** Broken by hand: the frame is narrow, and left to wrap the first line
      orphans "wedding" onto a line of its own. */
  lead: "Your presence\nat our wedding\nis the greatest gift\nwe could ever receive.",
  blurb:
    "However, should you wish to bless us with a gift, a monetary contribution would be sincerely appreciated as we begin our future together.",
} as const;

// ---------------------------------------------------------------------- rsvp

export const RSVP = {
  heading: "RSVP",
  blurbPrefix:
    "Nothing would make us happier than celebrating this day surrounded by our favourite people. Please let us know whether you'll be able to join us by ",
  /**
   * Seating is by named guest only. This is also why the form has no +1 and
   * no children stepper — the template offered both, and leaving controls
   * that add guests next to a note saying not to would just invite confusion.
   */
  note: "Kindly note that this invitation is exclusively reserved for the named guest. We respectfully request no additional guests or plus-ones. Thank you for your understanding.",
  openLabel: "Tap to open",
  attending: [
    { value: "yes", label: "Joyfully accepts" },
    { value: "no", label: "Regretfully declines" },
  ],
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

/**
 * The opening sequence: a still of the sealed envelope, then two clips —
 * the envelope opening, then the ribboned invitation being unwrapped.
 *
 * These are the original's own files and together they weigh ~34MB, which is
 * most of what a first-time visitor downloads. The wax seal in the envelope
 * clip carries the template couple's monogram; unlike the still seals it
 * cannot be re-lettered, so it still reads "C & J".
 */
export const INTRO = {
  poster: p("/intro/envelope-poster.jpg"),
  envelope: p("/intro/envelope.mp4"),
  bridge: p("/intro/bridge.mp4"),
} as const;

export const AUDIO = {
  /**
   * "Beauty and the Beast" (violin / cello / piano arrangement), re-encoded
   * from the couple's 192kbps file to 128kbps — 4.4MB down to 2.9MB, which
   * matters because GitHub Pages serves this site slowly. Renamed too: the
   * original filename carried an emoji, Korean text and a box-drawing
   * character, none of which belong in a URL.
   */
  theme: p("/audio/beauty-and-the-beast.mp3"),
} as const;
