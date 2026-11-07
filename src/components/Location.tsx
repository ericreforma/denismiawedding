import { OutlineButton } from "./OutlineButton";
import { Reveal } from "./Reveal";
import { ART, LOCATION, mapsUrl } from "@/data/wedding";

export function Location() {
  return (
    <Reveal>
      <section id="location" className="pt-32 md:pt-44 pb-20 md:pb-28 px-6">
        <Reveal shift={20} className="max-w-md mx-auto text-center mix-blend-multiply">
          <h2 className="font-display text-5xl md:text-7xl text-foreground leading-none">
            {LOCATION.heading}
          </h2>

          <p className="text-foreground/80 text-[12px] md:text-[13px] font-helvetica leading-relaxed mt-8">
            {LOCATION.blurb}
          </p>
          <p className="text-foreground/80 text-[12px] md:text-[13px] font-helvetica leading-relaxed mt-4">
            {LOCATION.note}
          </p>

          <div className="relative left-1/2 -translate-x-1/2 w-[70%] md:w-[60%] max-w-none mt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              loading="lazy"
              decoding="async"
              src={ART.venue}
              alt="Illustration of the reception terrace"
              className="w-full h-auto select-none pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Two venues, so each gets its own name block and directions link. */}
          <div className="mt-6 flex flex-col items-center gap-10">
            {LOCATION.venues.map((venue) => (
              <div key={venue.kicker} className="flex flex-col items-center">
                <p className="font-display text-foreground/70 text-[11px] uppercase tracking-[0.25em]">
                  {venue.kicker}
                </p>
                {/* Smaller and looser than the template: its venue was two
                    short words, ours wrap to two lines and the script's
                    descenders collide at leading-none. */}
                <p className="font-doulaise text-[32px] md:text-[44px] text-foreground mt-2 leading-[1.15]">
                  {venue.name}
                </p>
                <p className="font-display text-foreground/70 text-base md:text-lg mt-3 uppercase tracking-[0.15em]">
                  {venue.city}
                </p>
                <div className="mt-6">
                  <OutlineButton href={mapsUrl(venue.mapQuery)}>
                    Get Directions
                  </OutlineButton>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </Reveal>
  );
}
