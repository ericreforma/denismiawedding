type Common = {
  children: React.ReactNode;
  /** Letter-spacing differs between the wide and narrow variants. */
  tracking?: string;
  padding?: string;
};

type AsLink = Common & { href: string; onClick?: never };
type AsButton = Common & { href?: never; onClick?: () => void };

/**
 * The double-rule button used throughout: an outer hairline border with a 3px
 * gap, an inner border, and a fill that inverts on hover.
 */
export function OutlineButton({
  children,
  tracking = "tracking-[0.32em]",
  padding = "px-10 py-3",
  ...rest
}: AsLink | AsButton) {
  const inner = (
    <span className="relative block border border-foreground/40 p-[3px] transition-colors duration-500 group-hover:border-foreground/70">
      <span
        className={`block border border-foreground/20 ${padding} transition-colors duration-500 group-hover:bg-foreground group-hover:text-background`}
      >
        <span className={`block text-[10px] ${tracking} uppercase leading-relaxed`}>
          {children}
        </span>
      </span>
    </span>
  );

  const cls = "group inline-flex flex-col items-center text-foreground";

  if ("href" in rest && rest.href) {
    return (
      <a href={rest.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={rest.onClick} className={cls}>
      {inner}
    </button>
  );
}
