import { Leaf } from "./Leaf";
import { SectionHeading } from "./SectionHeading";
import { CEREMONY, RECEPTION, mapsUrl } from "@/data/wedding";

type VenueCardProps = {
  kicker: string;
  time: string;
  venue: string;
  location: string;
  mapQuery: string;
};

function VenueCard({ kicker, time, venue, location, mapQuery }: VenueCardProps) {
  return (
    <article className="relative rounded-[2rem] bg-card p-8 sm:p-12 text-center shadow-lg shadow-sky-deep/10 border border-sky/40">
      <Leaf className="absolute -top-10 -left-8 w-24 opacity-70" />
      <Leaf className="absolute -bottom-10 -right-8 w-24 opacity-70 -scale-x-100 rotate-180" />

      <p className="text-xs uppercase tracking-[0.35em] text-clay">
        {kicker}
      </p>
      <h3 className="mt-4 font-script text-6xl text-sky-deep leading-none">
        {time}
      </h3>
      <p className="mt-6 text-2xl font-serif-display text-foreground">{venue}</p>
      <p className="text-muted-foreground">{location}</p>
      <a
        href={mapsUrl(mapQuery)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-sky-deep hover:text-clay transition"
      >
        View map →
      </a>
    </article>
  );
}

export function Details() {
  return (
    <section id="details" className="relative bg-sky-tint py-24 sm:py-32 px-6">
      <Leaf className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 opacity-40 rotate-180" />

      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker="Mark your calendar" title="The Details" />

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <VenueCard {...CEREMONY} />
          <VenueCard {...RECEPTION} />
        </div>
      </div>
    </section>
  );
}
