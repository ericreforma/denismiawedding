type RevealProps = {
  children: React.ReactNode;
  /** Travel distance in px. The original uses 40 for sections, 20 for content. */
  shift?: number;
  delayMs?: number;
  className?: string;
};

/** Wraps children in the scroll-reveal transition driven by `useReveal`. */
export function Reveal({
  children,
  shift = 40,
  delayMs = 0,
  className = "",
}: RevealProps) {
  return (
    <div
      className={`reveal ${className}`}
      style={
        {
          "--reveal-shift": `${shift}px`,
          "--reveal-delay": `${delayMs}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
