import { Reveal } from "./Reveal";
import { ART, STORY } from "@/data/wedding";

/** A pearl flanked by hairlines, used to break the story into movements. */
function PearlRule() {
  return (
    <div aria-hidden className="my-10 flex items-center justify-center gap-4">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-foreground/30" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ART.pearlDot}
        alt=""
        className="h-3 w-3 rounded-full shadow-[0_1px_2px_hsl(var(--foreground)/0.3)]"
      />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-foreground/30" />
    </div>
  );
}

const bodyCls =
  "text-foreground/80 text-[13px] md:text-[14px] font-helvetica leading-relaxed";

export function LoveStory() {
  return (
    <Reveal>
      <section id="story" className="relative py-24 md:py-32 px-6">
        <div className="mx-auto max-w-xl text-center">
          <Reveal shift={20}>
            <h2 className="font-doulaise text-6xl md:text-8xl text-foreground leading-[0.9]">
              {STORY.heading}
            </h2>

            <p className="mt-8 font-display text-xl md:text-2xl leading-snug text-foreground">
              {STORY.lead}
            </p>
          </Reveal>

          <PearlRule />

          <Reveal shift={20} delayMs={80}>
            <div className="space-y-5">
              {STORY.before.map((text) => (
                <p key={text.slice(0, 24)} className={bodyCls}>
                  {text}
                </p>
              ))}
            </div>
          </Reveal>

          {/* The proposal, lifted out of the prose. Set in the display serif
              rather than the script: Monsieur La Doulaise renders "YES." as an
              unreadable tangle of capitals, and detaches the apostrophe in
              "Mia's". The serif also stops it competing with the heading. */}
          <Reveal shift={20} delayMs={120}>
            <p className="font-display text-2xl md:text-4xl leading-snug tracking-wide text-foreground my-12 text-balance">
              {STORY.quote}
            </p>
          </Reveal>

          <Reveal shift={20} delayMs={160}>
            <div className="space-y-5">
              {STORY.after.map((text) => (
                <p key={text.slice(0, 24)} className={bodyCls}>
                  {text}
                </p>
              ))}
            </div>
          </Reveal>

          <PearlRule />

          <Reveal shift={20} delayMs={200}>
            <p className="font-display text-lg md:text-xl leading-relaxed text-foreground/90 text-balance">
              {STORY.closing.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </Reveal>
        </div>
      </section>
    </Reveal>
  );
}
