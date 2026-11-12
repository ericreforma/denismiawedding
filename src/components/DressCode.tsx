import { DressBoards } from "./DressBoards";
import { Reveal } from "./Reveal";
import { ART, DRESS_CODE } from "@/data/wedding";

export function DressCode() {
  return (
    <Reveal>
      <section className="w-full py-16 md:py-24 px-6">
        <Reveal shift={20} className="relative">
          <div className="relative bg-background left-1/2 -translate-x-1/2 w-[calc(88%+4px)] md:w-full md:left-0 md:translate-x-0 md:max-w-[465px] md:mx-auto z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              loading="lazy"
              decoding="async"
              src={ART.dressFrame}
              alt="Dress code on a lace frame"
              className="relative w-full h-auto select-none pointer-events-none"
              draggable={false}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ART.dressSeal}
              alt=""
              aria-hidden
              className="pointer-events-none select-none absolute right-[2%] bottom-[4%] w-[26%] h-auto rotate-[24deg] drop-shadow-[0_2px_3px_hsl(var(--foreground)/0.15)] z-20"
              draggable={false}
            />

            <div className="absolute inset-0 -translate-y-[5px] justify-center flex flex-col items-center text-center text-foreground px-[26%] pb-[7%] pointer-events-none select-none">
              <p className="font-display text-[43px] md:text-[67px] text-foreground leading-none">
                {DRESS_CODE.heading}
              </p>
              <p className="font-doulaise text-foreground text-3xl md:text-4xl leading-none whitespace-nowrap mt-2 md:mt-3">
                {DRESS_CODE.style}
              </p>


              <p className="text-foreground/80 text-[11px] md:text-[13px] font-helvetica leading-snug mt-6 md:mt-8 -mx-[12%] whitespace-pre-line">
                {DRESS_CODE.blurb}
              </p>
            </div>
          </div>
        </Reveal>

        {/* The couple's own boards, in the same section as the framed card
            because they are the dress code rather than a separate topic. */}
        <DressBoards />
      </section>
    </Reveal>
  );
}
