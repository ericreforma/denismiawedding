/**
 * The wedding party, when the couple have edited it themselves.
 *
 * The list in `wedding.ts` is the one the site ships with. It is also the one
 * that changes most — a ninong added, a bridesmaid withdrawn, a name spelled
 * properly at last — and every one of those edits was reaching a developer.
 * So the couple can now keep it themselves, in an `Entourage` tab of their
 * sheet that the invitation reads at run time.
 *
 * **An empty tab means the built-in list.** Nothing changes until they save
 * something, and clearing it puts the original back untouched.
 *
 * ## Why rows and not the nested shape
 *
 * `ENTOURAGE` is a nested thing: named groups, two columns of sponsors, and
 * roles that carry a line of verse and sometimes the object they hold. A
 * spreadsheet cannot hold that shape, and a blob of JSON in one cell would be
 * unreadable to the people whose list it is.
 *
 * So it travels flat — one row per group, in display order, with the names in
 * a single cell one per line. `toRows` and `fromRows` are the two halves of
 * that conversion and must stay in step: a section added to one is a section
 * silently dropped by the other.
 */

import { RSVP_ENDPOINT, hasEndpoint } from "./config";
import {
  ENTOURAGE,
  type EntourageGroup,
  type EntourageRole,
} from "./wedding";

/** Which part of the list a row belongs to. */
export type EntourageSection =
  | "couple"
  | "parents"
  | "principalSponsors"
  | "honorAttendants"
  | "weddingParty"
  | "secondarySponsors"
  | "bearers";

/**
 * One editable block.
 *
 * `title` names a plain group ("Ninongs", "Bridesmaids"). `line` and `item`
 * belong to the role-shaped sections, where the heading is a line of verse
 * and the object carried is sometimes named. A row only ever uses one or the
 * other, and `SECTION_SHAPE` says which.
 */
export type EntourageRow = {
  section: EntourageSection;
  title: string;
  line: string;
  item: string;
  names: string[];
};

/** What the editor should show for each section, and what to call it. */
export const SECTIONS: {
  key: EntourageSection;
  label: string;
  shape: "group" | "role";
  hint: string;
}[] = [
  { key: "couple", label: "The couple", shape: "group", hint: "Groom and bride." },
  { key: "parents", label: "Parents", shape: "group", hint: "One block per side." },
  {
    key: "principalSponsors",
    label: "Principal sponsors",
    shape: "group",
    hint: "The ninongs and the ninangs, in two columns.",
  },
  {
    key: "honorAttendants",
    label: "Best man & maid of honor",
    shape: "group",
    hint: "",
  },
  {
    key: "weddingParty",
    label: "Groomsmen & bridesmaids",
    shape: "group",
    hint: "",
  },
  {
    key: "secondarySponsors",
    label: "Secondary sponsors",
    shape: "role",
    hint: "Candle, veil and cord — each with its own line.",
  },
  {
    key: "bearers",
    label: "Bearers",
    shape: "role",
    hint: "Rings, coins, bible and flowers.",
  },
];

const CACHE_KEY = "dm-entourage";

/** The nested shape the page renders, as `ENTOURAGE` provides it. */
export type EntourageData = typeof ENTOURAGE;

/** Flatten the nested list into the rows the sheet holds. */
export function toRows(data: EntourageData): EntourageRow[] {
  const rows: EntourageRow[] = [];
  const group = (section: EntourageSection, groups: EntourageGroup[]) => {
    for (const g of groups) {
      rows.push({ section, title: g.title, line: "", item: "", names: g.names });
    }
  };
  const role = (section: EntourageSection, roles: EntourageRole[]) => {
    for (const r of roles) {
      rows.push({
        section,
        title: "",
        line: r.line,
        item: r.item ?? "",
        names: r.names,
      });
    }
  };

  group("couple", data.couple);
  group("parents", data.parents);
  group("principalSponsors", data.principalSponsors.columns);
  group("honorAttendants", data.honorAttendants);
  group("weddingParty", data.weddingParty);
  role("secondarySponsors", data.secondarySponsors.roles);
  role("bearers", data.bearers.roles);
  return rows;
}

/**
 * Rebuild the nested list from rows.
 *
 * The headings and blurb are not editable and come from the built-in list, so
 * a saved entourage can never arrive without them.
 */
export function fromRows(rows: EntourageRow[]): EntourageData {
  const groups = (section: EntourageSection): EntourageGroup[] =>
    rows
      .filter((r) => r.section === section)
      .map((r) => ({ title: r.title, names: r.names }));
  const roles = (section: EntourageSection): EntourageRole[] =>
    rows
      .filter((r) => r.section === section)
      .map((r) =>
        r.item
          ? { line: r.line, item: r.item, names: r.names }
          : { line: r.line, names: r.names },
      );

  return {
    ...ENTOURAGE,
    couple: groups("couple"),
    parents: groups("parents"),
    principalSponsors: {
      ...ENTOURAGE.principalSponsors,
      columns: groups("principalSponsors"),
    },
    honorAttendants: groups("honorAttendants"),
    weddingParty: groups("weddingParty"),
    secondarySponsors: {
      ...ENTOURAGE.secondarySponsors,
      roles: roles("secondarySponsors"),
    },
    bearers: { ...ENTOURAGE.bearers, roles: roles("bearers") },
  };
}

/** Longer than any name a person actually has. */
const LONGEST_REAL_NAME = 60;

/**
 * Does this list look like damage rather than a wedding party?
 *
 * The separator between names was mangled on its way through a copy and
 * paste, and it went wrong in two different directions, so this watches for
 * both:
 *
 * - **Shattered.** The separator became the empty string on the way *out*, so
 *   every name was split into its own letters: 917 single characters where
 *   the entourage should be.
 * - **Fused.** The separator became the empty string on the way *in*, so a
 *   whole column arrived as one string — "Mr. Donn Uriel BuenaventuraHon.
 *   Larry DabuHon. Edwin Policarpio…" — and read back as a single name.
 *
 * Neither is a judgement call. A list that is mostly one-letter names is
 * broken, and a 150-character name is not a name. Guests are better served by
 * the built-in list than by either.
 *
 * Deliberately narrow: a short list, an initial, and the longest real name
 * here (27 characters) are all left alone.
 */
export function looksCorrupt(rows: EntourageRow[]) {
  const names = rows.flatMap((r) => r.names).map((n) => n.trim());
  if (!names.length) return false;

  if (names.some((n) => n.length > LONGEST_REAL_NAME)) return true;

  if (names.length < 20) return false;
  const single = names.filter((n) => n.length <= 1).length;
  return single > names.length / 2;
}

/** Rows as the sheet has them, or an empty list meaning "use the built-in". */
export async function listEntourage(): Promise<EntourageRow[]> {
  if (!hasEndpoint()) return [];
  const res = await fetch(`${RSVP_ENDPOINT}?board=entourage`);
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error(data?.error || "Request failed");
  return Array.isArray(data.groups) ? (data.groups as EntourageRow[]) : [];
}

export function cachedEntourage(): EntourageRow[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return Array.isArray(saved) && saved.length ? saved : null;
  } catch {
    return null;
  }
}

export function cacheEntourage(rows: EntourageRow[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  } catch {
    /* Not caching is only slower, never wrong. */
  }
}

async function post<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(RSVP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new Error(`Request failed (${res.status})`);
  return data as T;
}

/** Replace the whole list in one write. */
export async function saveEntourage(key: string, rows: EntourageRow[]) {
  const data = await post<{ ok: boolean; rows?: number; error?: string }>({
    action: "entourage.save",
    key,
    groups: rows,
  });
  if (!data.ok) throw new Error(data.error || "Request failed");
  return data.rows ?? 0;
}

/** Empty the tab, which returns the invitation to the built-in list. */
export async function clearEntourage(key: string) {
  const data = await post<{ ok: boolean; error?: string }>({
    action: "entourage.clear",
    key,
  });
  if (!data.ok) throw new Error(data.error || "Request failed");
}
