"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { NutritionTotals } from "@/types";

interface Props {
  totals: NutritionTotals;
}

interface Tile {
  label: string;
  value: number;
  unit: string;
  decimals: number;
}

export default function NutritionPanel({ totals }: Props) {
  const scope = useRef<HTMLDivElement>(null);
  const numberRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const prevValues = useRef<Record<string, number>>({});

  const tiles: Tile[] = [
    { label: "Calories", value: totals.calories, unit: "kcal", decimals: 0 },
    { label: "Protein", value: totals.protein, unit: "g", decimals: 1 },
    { label: "Fat", value: totals.fats, unit: "g", decimals: 1 },
    { label: "Carbs", value: totals.carbs, unit: "g", decimals: 1 },
  ];

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      tiles.forEach((tile) => {
        const el = numberRefs.current.get(tile.label);
        if (!el) return;
        const prev = prevValues.current[tile.label] ?? 0;
        const next = tile.value;
        if (prev === next) return;

        if (reduce) {
          el.textContent = next.toFixed(tile.decimals);
        } else {
          const proxy = { v: prev };
          gsap.to(proxy, {
            v: next,
            duration: 0.45,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = proxy.v.toFixed(tile.decimals);
            },
          });
        }
        prevValues.current[tile.label] = next;
      });
    }, scope);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals.calories, totals.protein, totals.fats, totals.carbs]);

  return (
    <div ref={scope} className="forno-panel rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cheese animate-pulse shadow-[0_0_8px_hsl(42_92%_62%)]" />
        <p className="text-[9.5px] font-mono uppercase tracking-[0.25em] text-cheese/90">
          Live Nutrition
        </p>
      </div>
      <div className="flex flex-col divide-y divide-cream/8">
        {tiles.map((tile, i) => (
          <div
            key={tile.label}
            className={`flex items-baseline justify-between gap-2 py-2.5 ${i === 0 ? "pt-0" : ""}`}
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-cream/45">
              {tile.label}
            </span>
            <span className="font-display text-xl font-semibold text-cream tabular-nums leading-none">
              <span
                ref={(el) => {
                  if (el) numberRefs.current.set(tile.label, el);
                }}
              >
                {tile.value.toFixed(tile.decimals)}
              </span>
              <span className="text-[10px] text-cream/35 ml-1 font-normal font-ui">
                {tile.unit}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
