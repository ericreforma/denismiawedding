import { OutlineButton } from "./OutlineButton";
import { Reveal } from "./Reveal";
import { ART, TRANSPORT } from "@/data/wedding";

export function Transportation() {
  return (
    <Reveal>
      <section className="relative w-full mt-[70px] md:mt-[110px] py-36 md:py-56 px-6 bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ART.transportBg}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
        />

        <Reveal
          shift={20}
          className="relative z-[1] max-w-[340px] md:max-w-md mx-auto"
        >
          {/* The paper card the copy sits on, washed slightly lighter so the
              text keeps its contrast against the texture. */}
          <div
            className="relative text-center px-8 py-14 md:px-12 md:py-16 shadow-[0_10px_30px_-12px_hsl(var(--foreground)/0.35)]"
            style={{
              backgroundImage: `url(${ART.paper})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-white/45 pointer-events-none"
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ART.transportStamps}
              alt=""
              aria-hidden
              className="block w-[160px] md:w-[200px] h-auto mx-auto -rotate-6 translate-x-[10px]"
            />

            <h2 className="font-doulaise text-6xl md:text-8xl text-foreground leading-none mt-10">
              {TRANSPORT.heading}
            </h2>

            {TRANSPORT.paragraphs.map((text, i) => (
              <p
                key={i}
                className={`text-foreground/85 text-[13px] font-helvetica leading-relaxed ${
                  i === 0 ? "mt-6" : "mt-4"
                } max-w-[280px] md:max-w-[300px] mx-auto`}
              >
                {text}
              </p>
            ))}

            <div className="mt-8">
              <OutlineButton href={TRANSPORT.mapUrl}>
                {TRANSPORT.cta}
              </OutlineButton>
            </div>
          </div>
        </Reveal>
      </section>
    </Reveal>
  );
}
