import { Attire } from "@/components/Attire";
import { Countdown } from "@/components/Countdown";
import { Details } from "@/components/Details";
import { Entourage } from "@/components/Entourage";
import { Faq } from "@/components/Faq";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { Rsvp } from "@/components/Rsvp";
import { SiteFooter } from "@/components/SiteFooter";
import { Story } from "@/components/Story";
import { Toaster } from "@/components/Toaster";
import { CEREMONY, COUPLE, EVENT, FAQS, RECEPTION } from "@/data/wedding";

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: `${COUPLE.groom.full} & ${COUPLE.bride.full} Wedding`,
  startDate: EVENT.startISO,
  endDate: EVENT.endISO,
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  description: `A lush garden wedding celebration for ${COUPLE.groom.first} & ${COUPLE.bride.first}.`,
  location: [
    {
      "@type": "Place",
      name: CEREMONY.venue,
      address: `${CEREMONY.location}, Philippines`,
    },
    {
      "@type": "Place",
      name: RECEPTION.venue,
      address: `${RECEPTION.location}, Philippines`,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Toaster />

      <Hero />
      <Story />
      <Details />
      <Countdown />
      <Gallery />
      <Entourage />
      <Attire />
      <Faq />
      <Rsvp />
      <SiteFooter />
    </div>
  );
}
