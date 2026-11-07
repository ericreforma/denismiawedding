"use client";

import { useState } from "react";

import { AudioToggle } from "@/components/AudioToggle";
import { Countdown } from "@/components/Countdown";
import { DressCode } from "@/components/DressCode";
import { EnterOverlay } from "@/components/EnterOverlay";
import { Hero } from "@/components/Hero";
import { Location } from "@/components/Location";
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
  const [entered, setEntered] = useState(false);
  const { isMuted, startMusic, toggleMute } = useBackgroundMusic();
  useReveal();

  const handleEnter = () => {
    startMusic();
    setEntered(true);
  };

  return (
    <>
      <EnterOverlay onEnter={handleEnter} />

      <main className="bg-background text-foreground overflow-x-clip">
        <Hero visible={entered} />
        <Countdown />
        <ScratchReveal />
        <Location />
        <TheDay />
        <DressCode />
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
