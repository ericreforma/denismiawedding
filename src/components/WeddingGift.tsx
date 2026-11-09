import { Reveal } from "./Reveal";
import { ART, GIFT } from "@/data/wedding";

export function WeddingGift() {
  return (
    <Reveal>
      <section className="relative z-10 pt-6 md:pt-10 pb-4 md:pb-[70px] overflow-x-clip">
        <div className="relative w-full max-w-xl mx-auto aspect-[942/1164]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            decoding="async"
            src={ART.giftFrame}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full select-none pointer-events-none"
          />

          <div className="absolute left-[20%] right-[20%] top-[18%] bottom-[10%] flex flex-col items-center justify-center text-center">
            <h2 className="font-doulaise text-5xl md:text-7xl leading-[0.9] text-foreground mb-5 md:mb-8">
              <span className="block">{GIFT.heading[0]}</span>
              <span className="block">{GIFT.heading[1]}</span>
            </h2>

            <p className="whitespace-pre-line font-display text-xl md:text-3xl leading-tight text-foreground mb-4 md:mb-6">
              {GIFT.lead}
            </p>

            <p className="font-helvetica text-[11px] md:text-[14px] leading-relaxed text-foreground/80">
              {GIFT.blurb}
            </p>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
