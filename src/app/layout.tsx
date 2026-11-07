import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import localFont from "next/font/local";

import { CEREMONY, COUPLE, EVENT, RECEPTION } from "@/data/wedding";
import "./globals.css";

// Normal only. Google serves Cormorant Garamond italic at 400 but not at 500
// or 600, and asking for a combination it does not have makes next/font's
// Google loader throw at build time. Nothing on the page sets italic.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

/** Not on Google Fonts, so it ships with the repo. */
const doulaise = localFont({
  src: "../fonts/MonsieurLaDoulaise-Regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-doulaise",
  display: "swap",
});

/** Where the site is published. Override with NEXT_PUBLIC_SITE_URL for a custom domain. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ericreforma.github.io/denismiawedding";

const NAMES = `${COUPLE.one.first} & ${COUPLE.two.first}`;
const DESCRIPTION = `Join ${COUPLE.one.first} and ${COUPLE.two.first} on ${EVENT.dateLong} at ${CEREMONY.name}, with the reception at ${RECEPTION.name}. RSVP online.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: EVENT.pageTitle,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: `${NAMES} · ${EVENT.dateLong}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${NAMES} · ${EVENT.dateLong}`,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      translate="no"
      className={`${cormorant.variable} ${jost.variable} ${doulaise.variable}`}
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body>{children}</body>
    </html>
  );
}
