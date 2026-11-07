import { ART, CEREMONY, COUPLE, EVENT } from "@/data/wedding";

type HeroProps = { visible: boolean };

export function Hero({ visible }: HeroProps) {
  return (
    <section className="relative min-h-[100dvh] flex flex-col overflow-hidden bg-background">
      <div className="absolute inset-0 bg-background" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ART.heroFrame}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      <div
        className={`relative z-20 flex flex-col items-center justify-center flex-1 text-center px-6 transition-opacity duration-[2000ms] ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="font-display text-foreground text-[17px] md:text-[19px] tracking-wide leading-snug">
          <span className="block">Together with</span>
          <span className="block">their families</span>
        </p>

        <div className="mt-8 md:mt-10 flex flex-col items-center">
          <h1 className="font-ballet text-foreground text-[50px] md:text-[64px] leading-[0.95]">
            {COUPLE.one.first}
          </h1>
          <p className="font-display text-foreground text-lg md:text-xl leading-none my-2.5 md:my-3.5">
            &amp;
          </p>
          <h1 className="font-ballet text-foreground text-[50px] md:text-[64px] leading-[0.95]">
            {COUPLE.two.first}
          </h1>
        </div>

        <p className="font-display text-foreground text-lg md:text-xl mt-6 md:mt-8 tracking-wide">
          {EVENT.dateDotted}
        </p>

        <div className="mt-5 md:mt-6 flex flex-col items-center">
          <p className="font-display text-foreground text-xl md:text-2xl tracking-wide leading-snug">
            {CEREMONY.name}
          </p>
          <p className="font-display text-foreground text-[11px] md:text-xs uppercase tracking-[0.25em] mt-1">
            {CEREMONY.city}
          </p>
        </div>
      </div>
    </section>
  );
}
