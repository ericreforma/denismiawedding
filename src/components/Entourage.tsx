import { Leaf } from "./Leaf";
import { SectionHeading } from "./SectionHeading";
import { ENTOURAGE } from "@/data/wedding";

export function Entourage() {
  return (
    <section id="entourage" className="relative py-24 sm:py-32 px-6">
      <Leaf className="absolute -top-12 right-0 w-60 opacity-40 animate-drift" />
      <Leaf className="absolute bottom-0 -left-16 w-60 opacity-40 animate-drift-slow" />

      <div className="mx-auto max-w-5xl">
        <SectionHeading kicker="Standing with us" title="Entourage" />

        <div className="mt-16 grid gap-12 md:grid-cols-2">
          {ENTOURAGE.map((group) => (
            <div key={group.title} className="text-center">
              <p className="font-script text-4xl text-clay">
                {group.title}
              </p>
              <span className="leaf-divider" />
              <ul className="font-serif-display text-lg space-y-1 text-foreground/85">
                {group.names.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
