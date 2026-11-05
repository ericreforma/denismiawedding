import { Leaf } from "./Leaf";
import { COUPLE, EVENT } from "@/data/wedding";

export function SiteFooter() {
  return (
    <footer className="relative bg-sky-deep text-beige py-20 px-6 text-center overflow-hidden">
      <Leaf className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 opacity-30" />

      <div className="relative">
        <h2 className="font-script text-6xl sm:text-7xl">
          {COUPLE.groom.first} &amp; {COUPLE.bride.first}
        </h2>
        <p className="mt-2 tracking-[0.4em] uppercase text-beige/80 text-sm">
          {EVENT.dateStacked}
        </p>
        <span className="block w-24 h-px bg-beige/40 mx-auto my-8" />
        <p className="font-serif-display text-xl italic">
          Thank you for being part of our story.
        </p>
        <p className="mt-6 font-script text-4xl text-sand">{COUPLE.hashtag}</p>
      </div>
    </footer>
  );
}
