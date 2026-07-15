"use client";

import { useEffect, useState } from "react";

export default function IntroOverlay() {
  const [gone, setGone] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setGone(true);
      return;
    }

    const t1 = setTimeout(() => setClosing(true), 2200);
    const t2 = setTimeout(() => setGone(true), 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      onClick={() => setGone(true)}
      className={`fixed inset-0 z-[100] flex cursor-pointer items-center justify-center overflow-hidden transition-opacity duration-500 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden
      style={{
        background:
          "radial-gradient(circle at center, rgba(94, 122, 168, 0.12) 0%, rgba(13, 18, 28, 0.92) 42%, rgba(6, 10, 17, 0.98) 74%), linear-gradient(180deg, #101723 0%, #070b12 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(120, 150, 198, 0.08), transparent 34%)",
        }}
      />

      <div className="pointer-events-none relative flex w-full max-w-4xl flex-col items-center px-8 text-center">
        <div
          className="absolute left-1/2 top-1/2 h-80 w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(120, 148, 191, 0.08) 0%, rgba(120, 148, 191, 0.025) 48%, transparent 74%)",
          }}
        />

        <h1
          className="relative whitespace-nowrap text-[clamp(1.1rem,2.15vw,2.05rem)] font-semibold uppercase tracking-[0.055em] text-slate-200"
          style={{
            textShadow: "0 0 18px rgba(158, 184, 225, 0.04)",
            animation: "intro-title-rise 0.8s cubic-bezier(.16,1,.3,1) both",
          }}
        >
          Launching Flavor Studio
        </h1>

        <div
          className="relative mt-10 h-px w-full max-w-[32rem] overflow-hidden rounded-full bg-slate-200/10"
          style={{ animation: "intro-line-fade 0.7s ease-out 0.15s both" }}
        >
          <span
            className="absolute inset-y-0 left-1/2 w-52 -translate-x-1/2"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(186, 201, 225, 0.72), transparent)",
              boxShadow: "0 0 10px rgba(186, 201, 225, 0.18)",
              animation: "intro-line-sweep 1.45s ease-out 0.2s both",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes intro-title-rise {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.985);
            letter-spacing: 0.14em;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            letter-spacing: 0.08em;
          }
        }

        @keyframes intro-line-fade {
          0% {
            opacity: 0;
            transform: scaleX(0.72);
          }
          100% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes intro-line-sweep {
          0% {
            opacity: 0;
            transform: translateX(-50%) scaleX(0.2);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) scaleX(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          h1,
          div,
          span {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
