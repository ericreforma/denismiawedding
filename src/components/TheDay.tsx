import { Reveal } from "./Reveal";
import { ART, THE_DAY, TIMELINE } from "@/data/wedding";

export function TheDay() {
  return (
    <Reveal>
      {/* The drapery below is a border-image whose top and bottom slices are
          fixed heights (up to 985px + 538px). The box must clear that, or the
          stretchable middle collapses and the two halves meet in a hard seam —
          which is exactly what happens with a short timeline. The min-height
          keeps ~22rem of middle to stretch at every width. */}
      <section className="relative pt-20 md:pt-28 pb-[min(60vw,460px)] px-6 min-h-[calc(min(128vw,985px)+min(70vw,538px)+22rem)]">
        {/* Drapery behind the timeline, drawn as a border-image so the middle
            of the artwork stretches with the section while the top and bottom
            edges keep their proportions. */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-3xl pointer-events-none"
          style={{
            borderStyle: "solid",
            borderColor: "transparent",
            borderWidth: "min(128vw, 985px) 0px min(70vw, 538px)",
            borderImageSource: `url(${ART.timelineCurtain})`,
            borderImageSlice: "55% 0 30% fill",
            borderImageRepeat: "stretch",
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          <Reveal shift={20} className="text-center mb-8 mt-24 md:mt-28">
            <h2 className="relative z-10 -translate-x-4 font-doulaise text-6xl md:text-8xl text-foreground leading-[0.9]">
              {THE_DAY.heading[0]}
              <br />
              {THE_DAY.heading[1]}
            </h2>
            <p className="text-foreground/70 text-[13px] md:text-[15px] mt-4 font-helvetica leading-relaxed whitespace-pre-line">
              {THE_DAY.blurb}
            </p>
          </Reveal>

          <div className="relative max-w-[170px] md:max-w-[200px] mx-auto">
            <div className="absolute left-[5.5px] top-3 bottom-3 w-px bg-foreground/50" />
            <div className="space-y-10 md:space-y-12">
              {TIMELINE.map((item, i) => (
                <Reveal
                  key={item.title}
                  shift={20}
                  delayMs={i * 90}
                  className="relative grid grid-cols-[12px_minmax(0,1fr)] gap-x-5 text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ART.pearlDot}
                    alt=""
                    className="mt-1.5 w-3 h-3 rounded-full shadow-[0_1px_2px_hsl(var(--foreground)/0.3)]"
                  />
                  <div className="leading-snug">
                    <span className="block font-display text-2xl md:text-3xl text-foreground leading-none">
                      {item.time}
                      {item.meridiem && (
                        <span className="ml-1 text-[0.5em] tracking-[0.1em]">
                          {item.meridiem}
                        </span>
                      )}
                    </span>
                    <span className="block mt-2 font-body text-sm tracking-[0.2em] uppercase text-foreground">
                      {item.title}
                    </span>
                    <span className="block mt-1 font-helvetica text-foreground/70 text-[12px] md:text-[13px] leading-relaxed">
                      {item.detail}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
