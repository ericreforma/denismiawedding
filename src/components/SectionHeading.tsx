type SectionHeadingProps = {
  kicker?: string;
  title: string;
};

export function SectionHeading({ kicker, title }: SectionHeadingProps) {
  return (
    <div className="text-center">
      {kicker && (
        <p className="text-xs uppercase tracking-[0.35em] text-sky-deep/70">
          {kicker}
        </p>
      )}
      <h2 className="mt-3 text-4xl sm:text-5xl text-sky-deep">{title}</h2>
      <span className="leaf-divider" />
    </div>
  );
}
