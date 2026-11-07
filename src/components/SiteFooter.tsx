import { Reveal } from "./Reveal";
import { ART, COUPLE, EVENT, FOOTER } from "@/data/wedding";

export function SiteFooter() {
  return (
    <Reveal>
      <footer className="relative pt-32 md:pt-44 pb-20 text-center px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ART.footerSeal}
          alt={COUPLE.initials}
          draggable={false}
          className="w-28 md:w-36 h-auto mx-auto mb-8 -mt-3 pointer-events-none select-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
        />

        <p className="font-display text-xl md:text-3xl text-foreground/80 mb-10 leading-relaxed">
          {FOOTER.line}
        </p>

        <p className="text-[13px] text-foreground/60 font-helvetica mb-3">
          {FOOTER.signOff}
        </p>

        <p className="font-doulaise text-6xl md:text-7xl text-foreground mb-4 leading-tight">
          {COUPLE.one.first}{" "}
          <span className="text-3xl md:text-4xl text-foreground/50">&amp;</span>{" "}
          {COUPLE.two.first}
        </p>

        <p className="text-[13px] text-foreground/50 font-helvetica tracking-wide">
          {EVENT.dateLong}
        </p>
      </footer>
    </Reveal>
  );
}
