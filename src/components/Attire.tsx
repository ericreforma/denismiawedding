import { ATTIRE, PALETTE } from "@/data/wedding";

export function Attire() {
  return (
    <section id="attire" className="relative bg-sky-tint py-24 sm:py-32 px-6">
      <div className="mx-auto max-w-4xl text-center">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-deep/70">
            {ATTIRE.kicker}
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl text-sky-deep">
            {ATTIRE.title}
          </h2>
          <span className="leaf-divider" />
        </div>

        <p className="mt-8 text-lg font-serif-display text-foreground/85 leading-relaxed">
          {ATTIRE.intro}
        </p>

        <div className="mt-12 grid sm:grid-cols-2 gap-6 text-left">
          <div className="rounded-3xl bg-card p-8 border border-sky/40 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-clay">
              For Gentlemen
            </p>
            <p className="mt-3 font-serif-display text-xl">{ATTIRE.gentlemen}</p>
          </div>
          <div className="rounded-3xl bg-card p-8 border border-sky/40 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-clay">
              For Ladies
            </p>
            <p className="mt-3 font-serif-display text-xl">{ATTIRE.ladies}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {PALETTE.map((hex) => (
            <div key={hex} className="flex flex-col items-center gap-2">
              <span
                className="h-12 w-12 rounded-full border border-sky/40 shadow-sm"
                style={{ backgroundColor: hex }}
              />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {hex}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm uppercase tracking-[0.3em] text-sky-deep/70">
          {ATTIRE.note}
        </p>
      </div>
    </section>
  );
}
