"use client";

import { useEffect, useState } from "react";

/**
 * Warm, on-theme intro loader: a pizza assembles itself (dough → sauce →
 * cheese → toppings) inside a spinning oven-heat ring while "Launching
 * flavours" appears. Pure CSS animation + timeout dismissal (reliable even
 * when the tab is backgrounded). Click to skip. Respects reduced-motion.
 */

// Toppings that pop onto the loader pizza. Positions are % of the pizza box.
const TOPPINGS: {
  x: number;
  y: number;
  s: number;
  c: string;
  d: number;
  ring?: boolean;
}[] = [
  { x: 34, y: 30, s: 15, c: "hsl(4 74% 47%)", d: 0.55 }, // pepperoni
  { x: 62, y: 33, s: 14, c: "hsl(4 74% 47%)", d: 0.68 },
  { x: 47, y: 52, s: 14, c: "hsl(4 74% 47%)", d: 0.81 },
  { x: 29, y: 58, s: 10, c: "hsl(96 42% 40%)", d: 0.94 }, // green pepper
  { x: 67, y: 60, s: 10, c: "hsl(96 42% 40%)", d: 1.07 },
  { x: 54, y: 26, s: 8, c: "hsl(28 18% 14%)", d: 1.2, ring: true }, // olive
  { x: 40, y: 42, s: 8, c: "hsl(28 18% 14%)", d: 1.33, ring: true },
];

export default function IntroOverlay() {
  const [gone, setGone] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setGone(true);
      return;
    }
    const t1 = setTimeout(() => setClosing(true), 2300);
    const t2 = setTimeout(() => setGone(true), 2900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      onClick={() => setGone(true)}
      className={`forno-room fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer transition-opacity duration-500 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden
    >
      {/* warm pooled light */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 420,
          height: 420,
          background:
            "radial-gradient(circle, hsl(30 90% 52% / 0.18), transparent 65%)",
        }}
      />

      {/* Steam */}
      <div className="relative flex justify-center gap-3 mb-1" style={{ height: 34 }}>
        {[0, 0.5, 1].map((d, i) => (
          <span
            key={i}
            className="forno-steam block rounded-full"
            style={{
              width: 4,
              height: 26,
              background:
                "linear-gradient(to top, transparent, hsl(38 30% 92% / 0.6), transparent)",
              filter: "blur(2px)",
              animationDelay: `${d}s`,
            }}
          />
        ))}
      </div>

      {/* Pizza + oven-heat ring */}
      <div className="relative" style={{ width: 176, height: 176 }}>
        {/* rotating ember heat ring */}
        <div
          className="forno-spin absolute rounded-full"
          style={{
            inset: "-9%",
            background:
              "conic-gradient(from 0deg, transparent 0 55%, hsl(38 96% 60% / 0.95) 80%, hsl(24 95% 53% / 0.4) 92%, transparent 100%)",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px))",
          }}
        />

        {/* crust */}
        <div
          className="absolute inset-0 rounded-full forno-glow"
          style={{
            background:
              "radial-gradient(circle at 50% 42%, hsl(32 46% 40%), hsl(26 44% 26%))",
            boxShadow:
              "inset 0 0 14px hsl(20 50% 12% / 0.7), 0 12px 40px -8px hsl(24 90% 45% / 0.5)",
          }}
        />
        {/* dough */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "7%",
            background:
              "radial-gradient(circle at 48% 40%, hsl(38 52% 66%), hsl(34 44% 54%))",
          }}
        />
        {/* sauce */}
        <div
          className="forno-pop absolute rounded-full"
          style={{
            inset: "15%",
            background:
              "radial-gradient(circle at 50% 45%, hsl(6 72% 48%), hsl(4 68% 38%))",
            animationDelay: "0.15s",
          }}
        />
        {/* cheese sheen */}
        <div
          className="forno-pop absolute rounded-full"
          style={{
            inset: "16%",
            background:
              "radial-gradient(circle at 42% 36%, hsl(45 75% 78% / 0.55), transparent 62%)",
            animationDelay: "0.32s",
          }}
        />
        {/* toppings */}
        {TOPPINGS.map((t, i) => (
          <span
            key={i}
            className="forno-pop absolute rounded-full"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: t.s,
              height: t.s,
              marginLeft: -t.s / 2,
              marginTop: -t.s / 2,
              background: t.ring ? "transparent" : t.c,
              border: t.ring ? `${Math.round(t.s / 3)}px solid ${t.c}` : "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.45)",
              animationDelay: `${t.d}s`,
            }}
          />
        ))}
      </div>

      {/* Text */}
      <p className="font-display italic text-3xl md:text-4xl text-gradient-forno mt-7 leading-none">
        Launching flavours
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cream/45 mt-3 flex items-center gap-2">
        warming the oven
        <span className="flex gap-1">
          {[0, 0.2, 0.4].map((d, i) => (
            <span
              key={i}
              className="forno-blink w-1 h-1 rounded-full bg-ember"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
        </span>
      </p>
    </div>
  );
}
