type StatTileProps = {
  label: string;
  value: number;
  /** The headline number the couple actually watches. */
  emphasis?: boolean;
};

export function StatTile({ label, value, emphasis }: StatTileProps) {
  return (
    <div
      className={`rounded-xl border px-5 py-4 ${
        emphasis
          ? "border-foreground/30 bg-foreground text-background"
          : "border-foreground/15 bg-card"
      }`}
    >
      <p
        className={`font-display text-3xl md:text-4xl tabular-nums leading-none ${
          emphasis ? "text-background" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p
        className={`mt-2 font-sans text-[11px] uppercase tracking-[0.18em] ${
          emphasis ? "text-background/70" : "text-foreground/55"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
