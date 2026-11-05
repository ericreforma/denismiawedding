import { IMAGES } from "@/data/wedding";

type LeafProps = {
  className?: string;
  style?: React.CSSProperties;
};

/** Decorative floating foliage. Purely ornamental, hidden from assistive tech. */
export function Leaf({ className = "", style }: LeafProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={IMAGES.leaves}
      alt=""
      aria-hidden
      loading="lazy"
      className={`pointer-events-none select-none ${className}`}
      style={style}
    />
  );
}
