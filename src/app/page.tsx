"use client";

import { useState } from "react";

import { AudioToggle } from "@/components/AudioToggle";
import { Countdown } from "@/components/Countdown";
import { DressBoards } from "@/components/DressBoards";
import { DressCode } from "@/components/DressCode";
import { EnterOverlay } from "@/components/EnterOverlay";
import { Hero } from "@/components/Hero";
import { Location } from "@/components/Location";
import { LoveStory } from "@/components/LoveStory";
import { Rsvp } from "@/components/Rsvp";
import { ScratchReveal } from "@/components/ScratchReveal";
import { SiteFooter } from "@/components/SiteFooter";
import { TheDay } from "@/components/TheDay";
import { Transportation } from "@/components/Transportation";
import { WeddingGift } from "@/components/WeddingGift";
import { WhereToStay } from "@/components/WhereToStay";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { useReveal } from "@/hooks/useReveal";

export default function Home() {
  /** The hero text starts fading in under the intro's last beat. */
  const [heroVisible, setHeroVisible] = useState(false);
  /** The audio toggle only appears once the intro is out of the way. */
  const [entered, setEntered] = useState(false);
  const { isMuted, startMusic, toggleMute } = useBackgroundMusic();
  useReveal();

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
        <LoveStory />
        <Location />
        <TheDay />
        <DressCode />
        <DressBoards />
        <Transportation />
        <WhereToStay />
        <WeddingGift />
        <Rsvp />
        <SiteFooter />
      </main>

      <AudioToggle isMuted={isMuted} onToggle={toggleMute} visible={entered} />
    </>
  );
}
