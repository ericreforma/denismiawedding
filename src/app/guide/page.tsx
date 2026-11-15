import type { Metadata } from "next";

import { Documentation } from "@/components/dashboard/Documentation";
import { COUPLE } from "@/data/wedding";

export const metadata: Metadata = {
  title: `Dashboard guide · ${COUPLE.one.first} & ${COUPLE.two.first}`,
  // Not secret — it shows no guest's name — but it is nobody else's business.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The same handbook as the dashboard's Documentation tab, on its own page.
 *
 * It asks for no passcode on purpose. The one time the couple most need the
 * instructions is the time they cannot get in, and a guide locked behind the
 * thing it explains is no guide at all. It carries no guest data — every name
 * in its screenshots is invented — so there is nothing here to protect.
 */
export default function GuidePage() {
  return (
    <main className="min-h-[100svh] bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-5 py-12 md:px-8 md:py-16">
        <header className="border-b border-foreground/15 pb-6">
          <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-foreground/50">
            Dashboard Guide
          </p>
          <h1 className="mt-2 font-display text-[1.75rem] leading-tight sm:text-3xl md:text-4xl">
            {COUPLE.one.first} &amp; {COUPLE.two.first}
          </h1>
          <p className="mt-2 font-sans text-[13px] text-foreground/60">
            Keep this page. It needs no passcode.
          </p>
        </header>

        <Documentation printable />

        <p className="mt-16 border-t border-foreground/15 pt-6 text-center font-sans text-[12px] leading-relaxed text-foreground/45">
          Every name and reply in the pictures above is made up, for the guide.
        </p>
      </div>
    </main>
  );
}
