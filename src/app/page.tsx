"use client";

import { useState } from "react";

import { AudioToggle } from "@/components/AudioToggle";
import { Countdown } from "@/components/Countdown";
import { DressCode } from "@/components/DressCode";
import { Entourage } from "@/components/Entourage";
import { EnterOverlay } from "@/components/EnterOverlay";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { Location } from "@/components/Location";
import { LoveStory } from "@/components/LoveStory";
import { Rsvp } from "@/components/Rsvp";
import { ScratchReveal } from "@/components/ScratchReveal";
import { SiteFooter } from "@/components/SiteFooter";
import { TheDay } from "@/components/TheDay";
import { SaveTheDate } from "@/components/SaveTheDate";
import { WeddingGift } from "@/components/WeddingGift";
import { InviteBlocked } from "@/components/invite/InviteBlocked";
import { InviteProvider, useGuest } from "@/components/invite/InviteProvider";
import { INVITE_ONLY } from "@/data/invite";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { useReveal } from "@/hooks/useReveal";

export default function Home() {
  return (
    <InviteProvider>
      <Invitation />
    </InviteProvider>
  );
}

function Invitation() {
  const { state } = useGuest();

  /** The hero text starts fading in under the intro's last beat. */
  const [heroVisible, setHeroVisible] = useState(false);
  /** The audio toggle only appears once the intro is out of the way. */
  const [entered, setEntered] = useState(false);
  const { isMuted, startMusic, toggleMute } = useBackgroundMusic();
  useReveal();

  // A link someone else's device claimed, and — only when the couple have
  // closed the site — a visitor with no working invitation at all.
  if (state === "blocked" || (INVITE_ONLY && state === "none")) {
    return <InviteBlocked />;
  }

  return (
    <>
      <EnterOverlay
        onStartMusic={startMusic}
        onShowHeroText={() => setHeroVisible(true)}
        onEnter={() => setEntered(true)}
      />

      <main className="bg-background text-foreground overflow-x-clip">
        <Hero visible={heroVisible} />
        <Countdown />
        <ScratchReveal />
        {/* Section order is the couple's own. */}
        <LoveStory />
        <Gallery />
        <SaveTheDate />
        <Location />
        <TheDay />
        <Entourage />
        <DressCode />
        <WeddingGift />
        <Rsvp />
        <SiteFooter />
      </main>

      <AudioToggle isMuted={isMuted} onToggle={toggleMute} visible={entered} />
    </>
  );
}
