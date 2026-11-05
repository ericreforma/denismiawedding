"use client";

import { useRef } from "react";
import { toast } from "sonner";

import { Leaf } from "./Leaf";
import { SectionHeading } from "./SectionHeading";
import { ATTENDING_OPTIONS, EVENT } from "@/data/wedding";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  defaultValue?: string | number;
};

const inputClass =
  "w-full rounded-xl border border-input bg-field px-4 py-3 font-serif-display text-base outline-none focus:border-sky-deep focus:ring-2 focus:ring-sky/30 transition";

function Field({
  label,
  name,
  type = "text",
  required,
  min,
  max,
  defaultValue,
}: FieldProps) {
  const id = `rsvp-${name}`;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs uppercase tracking-[0.3em] text-sky-deep mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        defaultValue={defaultValue}
        className={inputClass}
      />
    </div>
  );
}

export function Rsvp() {
  const formRef = useRef<HTMLFormElement>(null);

  // No backend yet — acknowledge locally and clear the form.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Thank you! Your RSVP has been received 🌿", {
      description: "We can't wait to celebrate with you.",
    });
    formRef.current?.reset();
  };

  return (
    <section id="rsvp" className="relative bg-sky-tint py-24 sm:py-32 px-6">
      <Leaf className="absolute top-6 right-6 w-40 opacity-50 animate-drift" />
      <Leaf className="absolute bottom-6 left-6 w-40 opacity-50 animate-drift-slow -scale-x-100" />

      <div className="mx-auto max-w-2xl">
        <SectionHeading kicker={`Kindly reply by ${EVENT.rsvpBy}`} title="RSVP" />

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-12 space-y-5 rounded-3xl bg-card p-8 sm:p-10 border border-sky/40 shadow-lg shadow-sky-deep/10"
        >
          <Field label="Full Name" name="name" required />
          <Field label="Email" name="email" type="email" required />

          <div>
            <span
              id="rsvp-attending-label"
              className="block text-xs uppercase tracking-[0.3em] text-sky-deep mb-2"
            >
              Will you be attending?
            </span>
            <div
              role="radiogroup"
              aria-labelledby="rsvp-attending-label"
              className="grid grid-cols-2 gap-3"
            >
              {ATTENDING_OPTIONS.map((option, i) => (
                <label
                  key={option}
                  className="cursor-pointer rounded-xl border border-sky/40 px-4 py-3 text-center font-serif-display text-base has-[:checked]:bg-sky/40 has-[:checked]:border-sky-deep transition"
                >
                  <input
                    type="radio"
                    name="attending"
                    value={option}
                    defaultChecked={i === 0}
                    required
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <Field
            label="Number of Guests (per invitation)"
            name="guests"
            type="number"
            min={1}
            max={4}
            defaultValue={1}
          />

          <div>
            <label
              htmlFor="rsvp-message"
              className="block text-xs uppercase tracking-[0.3em] text-sky-deep mb-2"
            >
              Dietary restrictions or a message for the couple
            </label>
            <textarea
              id="rsvp-message"
              name="message"
              rows={4}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-sky-deep px-8 py-4 text-sm uppercase tracking-[0.3em] text-beige shadow-lg shadow-sky-deep/30 transition hover:scale-[1.02] hover:bg-sky-deep/90"
          >
            Send RSVP
          </button>
        </form>
      </div>
    </section>
  );
}
