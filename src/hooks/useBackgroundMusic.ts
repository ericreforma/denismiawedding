"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AUDIO } from "@/data/wedding";

/**
 * One looping <audio> shared by the whole page, held outside React so a
 * remount never starts a second copy playing over the first.
 */
let shared: HTMLAudioElement | null = null;
let started = false;
/** Set while something else — the save-the-date film — is holding the floor. */
let duckedByVideo = false;

/**
 * Silence the background theme while another sound plays, and put it back
 * afterwards. Exported as plain functions rather than through the hook so the
 * video does not have to own a copy of the player's state.
 *
 * `duckTheme` reports whether it actually paused anything, but callers can
 * ignore that: `restoreTheme` only resumes what this paused, so a guest who
 * muted the music before pressing play does not get it back unasked.
 */
export function duckTheme() {
  if (!shared || shared.paused) return false;
  shared.pause();
  duckedByVideo = true;
  return true;
}

export function restoreTheme() {
  if (!shared || !duckedByVideo) return;
  duckedByVideo = false;
  shared.play().catch(() => {
    /* Nothing to do: the mute button can start it again. */
  });
}

export function useBackgroundMusic() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!shared) {
      shared = new Audio(AUDIO.theme);
      shared.loop = true;
      shared.volume = 0.5;
    }
    ref.current = shared;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    shared.addEventListener("play", onPlay);
    shared.addEventListener("pause", onPause);
    setIsPlaying(!shared.paused);
    setIsMuted(shared.muted);

    return () => {
      shared?.removeEventListener("play", onPlay);
      shared?.removeEventListener("pause", onPause);
    };
  }, []);

  /** Called from the enter screen — browsers only allow play() after a gesture. */
  const startMusic = useCallback(() => {
    if (!ref.current || started) return;
    started = true;
    ref.current.play().catch(() => {
      /* Autoplay blocked; the mute button can still start it. */
    });
  }, []);

  const toggleMute = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // If the gesture gate never opened, treat the first tap as "start".
    if (el.paused) {
      el.muted = false;
      setIsMuted(false);
      started = true;
      el.play().catch(() => {});
      return;
    }
    el.muted = !el.muted;
    setIsMuted(el.muted);
  }, []);

  return { isMuted, isPlaying, startMusic, toggleMute };
}
