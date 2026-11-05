import type { Metadata } from "next";
import { Cormorant_Garamond, Nunito_Sans, Tangerine } from "next/font/google";

import { CEREMONY, COUPLE, EVENT, IMAGES, RECEPTION } from "@/data/wedding";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-nunito-sans",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

const tangerine = Tangerine({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-tangerine",
  display: "swap",
});

/** Where the site is published. Override with NEXT_PUBLIC_SITE_URL for a custom domain. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ericreforma.github.io/denismiawedding";

const COUPLE_NAMES = `${COUPLE.groom.first} & ${COUPLE.bride.first}`;
const DESCRIPTION = `A lush garden wedding celebration. ${CEREMONY.venue} & ${RECEPTION.venue}, ${CEREMONY.location}. ${COUPLE.hashtag}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${COUPLE_NAMES} — In Bloom · ${EVENT.dateLong}`,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: `${COUPLE_NAMES} — In Bloom`,
    description: `Join us ${EVENT.dateLong} in ${CEREMONY.location}. ${COUPLE.hashtag}`,
    url: "/",
    images: [IMAGES.hero],
  },
  twitter: {
    card: "summary_large_image",
    title: `${COUPLE_NAMES} — ${EVENT.dateLong}`,
    description: `Join us as ${COUPLE.groom.first} & ${COUPLE.bride.first} say 'I do' in a lush garden celebration — ${EVENT.dateLong}.`,
    images: [IMAGES.hero],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${nunitoSans.variable} ${cormorantGaramond.variable} ${tangerine.variable}`}
    >
      <head>
        <link rel="preload" as="image" href={IMAGES.hero} fetchPriority="high" />
      </head>
      <body>{children}</body>
    </html>
  );
}
