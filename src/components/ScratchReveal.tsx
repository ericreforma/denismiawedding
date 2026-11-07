"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ART, COUPLE, PHOTOS } from "@/data/wedding";

/** Where the oval sits on the mother-of-pearl panel, in % of the panel. */
const OVAL = { left: 33, top: 25, width: 34.1, height: 50.2 };

/** Fraction of the covering that must be cleared before it fades away. */
const REVEAL_AT = 0.55;

export function ScratchReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  /** True once the visitor has made a mark, so a late paint can stand down. */
  const touched = useRef(false);
  const [revealed, setRevealed] = useState(false);

  // Paint the covering once the canvas has a real size.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const paint = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 20 || rect.height < 20) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;
      ctx.fillStyle = "rgb(235,227,215)";
      ctx.fillRect(0, 0, w, h);

      // next/font generates a hashed family name, so read it off the CSS
      // variable rather than hard-coding the face's real name.
      const scriptFamily =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--font-script")
          .trim() || "cursive";

      const paper = new Image();
      paper.onload = async () => {
        try {
          await document.fonts.load(`40px ${scriptFamily}`);
        } catch {
          /* The prompt just falls back to a system cursive. */
        }
        // If the visitor got here first, their scratches are already on the
        // canvas — repainting now would wipe them.
        if (touched.current) return;
        // Cover-fit the paper texture.
        const scale = Math.max(w / paper.width, h / paper.height);
        const pw = paper.width * scale;
        const ph = paper.height * scale;
        ctx.drawImage(paper, (w - pw) / 2, (h - ph) / 2, pw, ph);

        ctx.fillStyle = "hsla(212, 22%, 38%, 0.85)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${Math.max(18, w * 0.17)}px ${scriptFamily}`;
        ctx.fillText("Scratch", w / 2, h / 2 - w * 0.09);
        ctx.fillText("to reveal", w / 2, h / 2 + w * 0.09);
      };
      paper.src = ART.paper;
    };

    // Paint on the first resize that reports a usable box, then stop.
    let painted = false;
    const ro = new ResizeObserver(() => {
      if (painted) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 20 || rect.height < 20) return;
      painted = true;
      paint();
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  const pointAt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const scratch = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    touched.current = true;
    const point = pointAt(e);
    const radius = canvas.getBoundingClientRect().width * 0.09;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = radius * 2;
    ctx.beginPath();
    const from = last.current ?? point;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    last.current = point;
  }, []);

  /** Sample every 16th pixel's alpha; fade out once enough is cleared. */
  const checkCleared = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 16) {
      total++;
      if (data[i] === 0) clear++;
    }
    if (total > 0 && clear / total > REVEAL_AT) setRevealed(true);
  }, [revealed]);

  const endStroke = () => {
    drawing.current = false;
    last.current = null;
    checkCleared();
  };

  return (
    <section className="relative w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ART.welcomePanel}
        alt="Together with their families"
        className="block w-full h-auto select-none"
        loading="lazy"
        draggable={false}
      />

      <div
        className="absolute overflow-hidden"
        style={{
          left: `${OVAL.left}%`,
          top: `${OVAL.top}%`,
          width: `${OVAL.width}%`,
          height: `${OVAL.height}%`,
          borderRadius: "50%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PHOTOS.coupleScratch}
          alt={`${COUPLE.one.first} & ${COUPLE.two.first}`}
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-700"
          style={{
            touchAction: "none",
            opacity: revealed ? 0 : 1,
            pointerEvents: revealed ? "none" : "auto",
          }}
          onPointerDown={(e) => {
            drawing.current = true;
            last.current = null;
            e.currentTarget.setPointerCapture(e.pointerId);
            scratch(e);
          }}
          onPointerMove={scratch}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onPointerLeave={endStroke}
        />
      </div>

      {/* The pearl bezel: concentric rings plus an inner gold glow. */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          left: `${OVAL.left}%`,
          top: `${OVAL.top}%`,
          width: `${OVAL.width}%`,
          height: `${OVAL.height}%`,
          borderRadius: "50%",
          boxShadow:
            "rgb(216, 194, 151) 0px 0px 0px 3px, rgb(241, 237, 228) 0px 0px 0px 5px, rgb(197, 171, 119) 0px 0px 0px 6px, rgba(248, 246, 242, 0.55) 0px 0px 0px 12px, rgb(203, 180, 134) 0px 0px 0px 13px, rgba(60, 75, 93, 0.25) 0px 6px 18px, rgba(143, 116, 61, 0.35) 0px 0px 10px inset",
        }}
      />
    </section>
  );
}
