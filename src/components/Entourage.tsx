import { Reveal } from "./Reveal";
import {
  ART,
  ENTOURAGE,
  type EntourageGroup,
  type EntourageRole,
} from "@/data/wedding";

/** The divider the love story uses, repeated here to separate the blocks. */
function PearlRule() {
  return (
    <div aria-hidden className="my-12 flex items-center justify-center gap-4">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-foreground/30" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ART.pearlDot}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-3 w-3 rounded-full shadow-[0_1px_2px_hsl(var(--foreground)/0.3)]"
      />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-foreground/30" />
    </div>
  );
}

/** The small caps label that sits above every list of names. */
function RoleLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-helvetica text-[11px] uppercase tracking-[0.22em] text-foreground/55">
      {children}
    </h3>
  );
}

function Names({ names, size = "base" }: { names: string[]; size?: "base" | "lead" }) {
  return (
    <ul className="mt-3 space-y-1">
      {names.map((name) => (
        <li
          key={name}
          className={`font-display text-foreground leading-snug ${
            size === "lead" ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
          }`}
        >
          {name}
        </li>
      ))}
    </ul>
  );
}

function Group({
  group,
  size,
}: {
  group: EntourageGroup;
  size?: "base" | "lead";
}) {
  return (
    <div>
      <RoleLabel>{group.title}</RoleLabel>
      <Names names={group.names} size={size} />
    </div>
  );
}

/**
 * Two blocks that read as a pair — bride's side and groom's side.
 *
 * They stack on a phone and sit side by side from `md` up. The gap is wide
 * enough that two columns of names are never mistaken for one.
 */
function Pair({
  groups,
  size,
}: {
  groups: EntourageGroup[];
  size?: "base" | "lead";
}) {
  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-12">
      {groups.map((group, i) => (
        <Reveal key={group.title} shift={20} delayMs={i * 90}>
          <Group group={group} size={size} />
        </Reveal>
      ))}
    </div>
  );
}

/**
 * A role written as the thing it carries.
 *
 * The couple's line is set in the serif italic rather than the script face.
 * Doulaise is a display face: these lines run to seven or eight words, which
 * is past what it stays legible at, it breaks them in awkward places, and its
 * apostrophe is so wide that "God's" reads as three words.
 */
function Role({ role, i }: { role: EntourageRole; i: number }) {
  return (
    <Reveal shift={20} delayMs={i * 80}>
      <div>
        {role.item && <RoleLabel>{role.item}</RoleLabel>}
        <p
          className={`font-display italic text-balance text-xl md:text-2xl leading-snug text-foreground/75 ${
            role.item ? "mt-2" : ""
          }`}
        >
          {role.line}
        </p>
        <ul className="mt-3 space-y-1">
          {role.names.map((name) => (
            <li
              key={name}
              className="font-display text-lg md:text-xl text-foreground leading-snug"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export function Entourage() {
  return (
    <Reveal>
      <section id="entourage" className="relative w-full py-20 md:py-28 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal shift={20}>
            <h2 className="font-doulaise text-6xl md:text-8xl text-foreground leading-none">
              {ENTOURAGE.heading}
            </h2>
            <p className="mx-auto mt-5 max-w-md text-foreground/70 text-[13px] font-helvetica leading-relaxed">
              {ENTOURAGE.blurb}
            </p>
          </Reveal>

          <div className="mt-12 md:mt-16">
            <Pair groups={ENTOURAGE.couple} size="lead" />

            <PearlRule />
            <Pair groups={ENTOURAGE.parents} />

            <PearlRule />
            <Reveal shift={20}>
              <RoleLabel>{ENTOURAGE.principalSponsors.title}</RoleLabel>
            </Reveal>
            {/* The ninong and ninang lists are the longest on the page, so
                they keep their own sub-headings inside the pair. */}
            <div className="mt-8">
              <Pair groups={ENTOURAGE.principalSponsors.columns} />
            </div>

            <PearlRule />
            <Pair groups={ENTOURAGE.honorAttendants} />

            <PearlRule />
            <Pair groups={ENTOURAGE.weddingParty} />

            <PearlRule />
            <Reveal shift={20}>
              <RoleLabel>{ENTOURAGE.secondarySponsors.title}</RoleLabel>
            </Reveal>
            <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
              {ENTOURAGE.secondarySponsors.roles.map((role, i) => (
                <Role key={role.line} role={role} i={i} />
              ))}
            </div>

            <PearlRule />
            <Reveal shift={20}>
              <RoleLabel>{ENTOURAGE.bearers.title}</RoleLabel>
            </Reveal>
            <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-12">
              {ENTOURAGE.bearers.roles.map((role, i) => (
                <Role key={role.line} role={role} i={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
