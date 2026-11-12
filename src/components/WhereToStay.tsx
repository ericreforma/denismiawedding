import { OutlineButton } from "./OutlineButton";
import { Reveal } from "./Reveal";
import { ART, HOTELS, STAY } from "@/data/wedding";

export function WhereToStay() {
  return (
    <Reveal>
      <section className="relative py-20 md:py-28 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <Reveal shift={20} className="text-center">
            <h2 className="font-doulaise text-6xl md:text-8xl text-foreground mb-2 mt-10">
              {STAY.heading}
            </h2>
            <p className="text-foreground/80 text-[13px] mt-6 max-w-md mx-auto leading-relaxed font-helvetica">
              {STAY.blurb}
            </p>
          </Reveal>

          <div className="mt-8 md:mt-12 space-y-8 md:space-y-10">
            {HOTELS.map((hotel, i) => (
              <Reveal key={hotel.name + i} shift={24} delayMs={i * 100}>
                <div className="relative max-w-md mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ART.hotelFrame}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
                  />
                  <div className="relative z-10 px-[23%] pt-[110px] pb-[130px] md:pt-[145px] md:pb-[170px] text-center">
                    <h3 className="font-display text-3xl md:text-4xl text-foreground leading-tight whitespace-pre-line">
                      {hotel.name}
                    </h3>

                    <ul className="mt-5 space-y-1.5">
                      <li className="text-foreground/80 text-[12px] md:text-[13px] font-helvetica tracking-wide">
                        <span className="block uppercase text-[11px] tracking-[0.14em] text-foreground/60">
                          Recommended stay
                        </span>
                        {hotel.stay}
                      </li>
                      <li className="text-foreground/80 text-[12px] md:text-[13px] font-helvetica tracking-wide">
                        <span className="block uppercase text-[11px] tracking-[0.14em] text-foreground/60">
                          Wedding guest rate
                        </span>
                        {hotel.rate}
                      </li>
                      <li className="text-foreground/80 text-[12px] md:text-[13px] font-helvetica tracking-wide">
                        <span className="block uppercase text-[11px] tracking-[0.14em] text-foreground/60">
                          Parking
                        </span>
                        {hotel.parking}
                      </li>
                    </ul>

                    <p className="text-foreground/80 text-[13px] mt-5 leading-relaxed font-helvetica">
                      {hotel.blurb}
                    </p>

                    <div className="mt-7">
                      <OutlineButton
                        href={hotel.mapUrl}
                        tracking="tracking-[0.24em]"
                        padding="px-3 py-3"
                      >
                        Book
                      </OutlineButton>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
