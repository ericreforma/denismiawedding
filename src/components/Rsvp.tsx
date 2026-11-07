"use client";

import { useMemo, useState } from "react";

import { Reveal } from "./Reveal";
import { ART, COUPLE, EVENT, RSVP } from "@/data/wedding";

const labelCls =
  "block text-background font-sans text-[11px] tracking-[0.25em] uppercase";
const fieldCls =
  "mt-2 w-full bg-transparent border-b border-background/20 text-background placeholder:text-background/40 focus:border-background/50 focus:outline-none font-display text-center text-lg py-2 transition-colors";

/** A radio rendered as a small ring that fills when chosen. */
function Choice({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group/choice">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only peer"
      />
      <span className="relative grid h-4 w-4 place-items-center rounded-full border border-background/40 transition-colors peer-focus-visible:ring-1 peer-focus-visible:ring-background/60">
        <span
          className={`block h-2 w-2 rounded-full bg-background transition-transform duration-200 ${
            checked ? "scale-100" : "scale-0"
          }`}
        />
      </span>
      <span className="font-display text-background text-base">{children}</span>
    </label>
  );
}

export function Rsvp() {
  const [opened, setOpened] = useState(false);
  const [formShown, setFormShown] = useState(false);
  const [sent, setSent] = useState(false);

  const [name, setName] = useState("");
  const [attending, setAttending] = useState("yes");
  const [plusOne, setPlusOne] = useState("no");
  const [children, setChildren] = useState(0);
  const [diets, setDiets] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  /** The flap lifts, then the form unfolds 700ms later. */
  const openEnvelope = () => {
    if (opened) return;
    setOpened(true);
    setTimeout(() => setFormShown(true), 700);
  };

  const adults = 1 + (plusOne === "yes" ? 1 : 0);
  const guestLabels = useMemo(() => {
    if (attending !== "yes") return [];
    return [
      ...Array.from({ length: adults }, (_, i) => `Guest ${i + 1}`),
      ...Array.from({ length: children }, (_, i) => `Child ${i + 1}`),
    ];
  }, [attending, adults, children]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Bots fill the hidden field; people never see it.
    if (honeypot) return;
    // No backend yet — acknowledge locally.
    setSent(true);
  };

  return (
    <Reveal>
      <section
        id="rsvp"
        className="relative z-10 -mt-[30px] pt-0 pb-20 md:pb-28 bg-foreground"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ART.rsvpTopBorder}
          alt=""
          draggable={false}
          className="block w-full h-auto pointer-events-none select-none"
        />

        <div className="px-6 pt-10 md:pt-16">
          <div className="max-w-2xl mx-auto pt-[60px]">
            <Reveal shift={20}>
              <div className="text-center mb-10 flex flex-col items-center">
                <h2 className="font-display text-5xl md:text-7xl text-background">
                  {RSVP.heading}
                </h2>
                <p className="text-background/80 text-[15px] font-sans leading-relaxed max-w-md mt-4">
                  {RSVP.blurbPrefix}
                  {EVENT.rsvpBy}.
                </p>
              </div>

              {!sent && (
                <button
                  type="button"
                  onClick={openEnvelope}
                  aria-label="Open the RSVP envelope"
                  aria-expanded={formShown}
                  disabled={opened}
                  className="relative block mx-auto w-[260px] md:w-[340px] aspect-square mb-10 cursor-pointer disabled:cursor-default"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ART.envelopeClosed}
                    alt=""
                    draggable={false}
                    className={`absolute inset-0 w-full h-full object-contain object-bottom transition-all duration-700 ${
                      opened ? "opacity-0 scale-95" : "opacity-100 hover:scale-[1.03]"
                    }`}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ART.envelopeOpen}
                    alt=""
                    draggable={false}
                    className={`absolute inset-0 w-full h-full object-contain object-bottom transition-opacity duration-700 ${
                      opened ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {!opened && (
                    <span className="absolute -bottom-7 left-0 right-0 text-center text-[10px] tracking-[0.32em] uppercase text-background/80">
                      {RSVP.openLabel}
                    </span>
                  )}
                </button>
              )}

              {sent ? (
                <div className="text-center animate-[fadeUp_1s_ease-out_both]">
                  <p className="font-doulaise text-5xl md:text-6xl text-background leading-none">
                    Thank you!
                  </p>
                  <p className="text-background/80 text-[15px] font-sans leading-relaxed max-w-md mx-auto mt-6">
                    {attending === "yes"
                      ? `We have your reply and we cannot wait to celebrate with you on ${EVENT.dateLong}.`
                      : "Thank you for letting us know. You will be missed, and we hope to celebrate with you another time."}
                  </p>
                  <p className="font-doulaise text-4xl text-background/90 mt-8">
                    {COUPLE.one.first} &amp; {COUPLE.two.first}
                  </p>
                </div>
              ) : (
                formShown && (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-8 text-center animate-[fadeUp_1.6s_cubic-bezier(0.22,1,0.36,1)_both]"
                  >
                    {/* Honeypot: off-screen, hidden from assistive tech. */}
                    <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
                      <label htmlFor="website">Website</label>
                      <input
                        type="text"
                        id="website"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="rsvp-name" className={labelCls}>
                        Your Name
                      </label>
                      <input
                        id="rsvp-name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className={fieldCls}
                      />
                    </div>

                    <div>
                      <span className={labelCls}>Will you be attending?</span>
                      <div className="flex flex-col items-center gap-3 mt-3">
                        {RSVP.attending.map((opt) => (
                          <Choice
                            key={opt.value}
                            name="attending"
                            value={opt.value}
                            checked={attending === opt.value}
                            onChange={setAttending}
                          >
                            {opt.label}
                          </Choice>
                        ))}
                      </div>
                    </div>

                    {attending === "yes" && (
                      <>
                        <div>
                          <span className={labelCls}>Will you be bringing a +1?</span>
                          <div className="flex flex-col items-center gap-3 mt-3">
                            {RSVP.plusOne.map((opt) => (
                              <Choice
                                key={opt.value}
                                name="plusOne"
                                value={opt.value}
                                checked={plusOne === opt.value}
                                onChange={setPlusOne}
                              >
                                {opt.label}
                              </Choice>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className={labelCls}>Children</span>
                          <div className="mt-3 flex items-center justify-center gap-5">
                            <button
                              type="button"
                              aria-label="Remove one child"
                              onClick={() => setChildren((c) => Math.max(0, c - 1))}
                              disabled={children === 0}
                              className="grid h-9 w-9 place-items-center rounded-full border border-background/30 text-background text-lg leading-none transition-colors hover:bg-background/10 disabled:opacity-30"
                            >
                              &minus;
                            </button>
                            <span className="font-display text-background text-base min-w-[7.5rem]">
                              {children === 0
                                ? "No children"
                                : `${children} ${children === 1 ? "child" : "children"}`}
                            </span>
                            <button
                              type="button"
                              aria-label="Add one child"
                              onClick={() =>
                                setChildren((c) => Math.min(RSVP.maxChildren, c + 1))
                              }
                              disabled={children === RSVP.maxChildren}
                              className="grid h-9 w-9 place-items-center rounded-full border border-background/30 text-background text-lg leading-none transition-colors hover:bg-background/10 disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className={labelCls}>Dietary Requirements</span>
                          <div className="mt-3 space-y-3">
                            {guestLabels.map((guest, i) => (
                              <div
                                key={guest}
                                className="flex flex-col items-center gap-1"
                              >
                                <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-background/60">
                                  {guest}
                                </span>
                                <input
                                  value={diets[i] ?? ""}
                                  onChange={(e) =>
                                    setDiets((prev) => {
                                      const next = [...prev];
                                      next[i] = e.target.value;
                                      return next;
                                    })
                                  }
                                  placeholder="Allergies or dietary requirements"
                                  className={fieldCls}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label htmlFor="rsvp-message" className={labelCls}>
                        A Note for the Couple
                      </label>
                      <textarea
                        id="rsvp-message"
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Leave us a little message, if you'd like."
                        className={`${fieldCls} resize-none`}
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="group inline-flex flex-col items-center text-background"
                      >
                        <span className="relative block border border-background/40 p-[3px] transition-colors duration-500 group-hover:border-background/70">
                          <span className="block border border-background/20 px-10 py-3 transition-colors duration-500 group-hover:bg-background group-hover:text-foreground">
                            <span className="block text-[10px] tracking-[0.32em] uppercase">
                              Send RSVP
                            </span>
                          </span>
                        </span>
                      </button>
                    </div>
                  </form>
                )
              )}
            </Reveal>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
