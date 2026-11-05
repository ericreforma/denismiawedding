import { Leaf } from "./Leaf";
import { SectionHeading } from "./SectionHeading";
import { IMAGES, STORY_PARAGRAPHS, STORY_SIGNATURE } from "@/data/wedding";

export function Story() {
  return (
    <section id="story" className="relative py-24 sm:py-32 px-6">
      <Leaf className="absolute -top-16 -right-20 w-72 opacity-40 animate-drift" />
      <Leaf className="absolute bottom-0 -left-24 w-80 opacity-30 animate-drift-slow -scale-x-100" />

      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker="How it started" title="Our Story" />

        <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          <div className="relative">
            {/* Tilted sky card peeking out behind the photo. */}
            <div className="absolute -inset-3 rounded-[2rem] bg-sky/70 -rotate-2" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={IMAGES.story}
              alt="The couple together"
              loading="lazy"
              className="relative rounded-[2rem] shadow-xl shadow-sky-deep/15 w-full h-auto object-cover"
            />
          </div>

          <div className="space-y-5 font-serif-display text-lg sm:text-xl text-foreground/85 leading-relaxed">
            {STORY_PARAGRAPHS.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            <p className="font-script text-4xl text-clay pt-2">
              {STORY_SIGNATURE}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
