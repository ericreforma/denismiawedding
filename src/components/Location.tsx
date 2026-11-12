import { OutlineButton } from "./OutlineButton";
import { Reveal } from "./Reveal";
import { LOCATION } from "@/data/wedding";

export function Location() {
  return (
    <Reveal>
      <section id="location" className="pt-32 md:pt-44 pb-20 md:pb-28 px-6">
        {/* mix-blend-multiply is the template's; note it is inert here,
            because Reveal's transform isolates this block from the page
            backdrop. Kept for parity with the original, but nothing may
            depend on it — the venue logo bakes its ivory ground in instead. */}
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

          {/* One block per venue, each with its own image, address and map. */}
          <div className="mt-12 flex flex-col items-center gap-14">
            {LOCATION.venues.map((venue) => (
              <div key={venue.kicker} className="flex flex-col items-center w-full">
                <p className="font-display text-foreground/70 text-[11px] uppercase tracking-[0.25em]">
                  {venue.kicker}
                </p>

                {venue.image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      loading="lazy"
                      decoding="async"
                      src={venue.image}
                      alt={venue.name}
                      className="mt-4 w-[78%] max-w-[300px] h-auto rounded-xl select-none pointer-events-none"
                      draggable={false}
                    />
                    {/* Smaller and looser than the template: its venue was two
                        short words, ours wrap to two lines and the script's
                        descenders collide at leading-none. */}
                    <p className="font-doulaise text-[32px] md:text-[44px] text-foreground mt-5 leading-[1.15]">
                      {venue.name}
                    </p>
                  </>
                ) : (
                  /* The reception shows its own logo in place of the name.
                     The name still reaches screen readers through the alt. */
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    loading="lazy"
                    decoding="async"
                    src={venue.logo}
                    alt={venue.name}
                    className="mt-5 w-[88%] max-w-[330px] h-auto select-none pointer-events-none"
                    draggable={false}
                  />
                )}

                <p className="font-helvetica text-foreground/70 text-[12px] md:text-[13px] leading-relaxed mt-4 max-w-[19rem]">
                  {venue.address}
                </p>

                <div className="mt-6">
                  <OutlineButton href={venue.mapUrl}>
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
