import { SectionHeading } from "./SectionHeading";
import { GALLERY } from "@/data/wedding";

export function Gallery() {
  return (
    <section id="gallery" className="relative bg-sand/45 py-24 sm:py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker="Moments" title="Gallery" />

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {GALLERY.map((photo) => (
            <div
              key={photo.src}
              className={`overflow-hidden rounded-3xl shadow-md shadow-sky-deep/10 ${photo.span}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
