import { Leaf } from "./Leaf";
import { SectionHeading } from "./SectionHeading";
import { FAQS } from "@/data/wedding";

export function Faq() {
  return (
    <section id="faq" className="relative py-24 sm:py-32 px-6">
      <Leaf className="absolute -top-12 -left-12 w-56 opacity-40 -scale-x-100" />

      <div className="mx-auto max-w-3xl">
        <SectionHeading kicker="Good to know" title="Frequently Asked" />

        <div className="mt-12 space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-sky/40 bg-card p-6 open:shadow-md transition"
            >
              <summary className="cursor-pointer list-none flex justify-between items-center font-serif-display text-lg text-sky-deep">
                {faq.q}
                {/* The plus rotates into an ✕ as the panel opens. */}
                <span className="text-clay text-2xl transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-foreground/80 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
