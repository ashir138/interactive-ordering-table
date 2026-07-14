"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { MenuItem, NutritionTotals } from "@/types";

interface Props {
  items: MenuItem[];
  totals: NutritionTotals;
  onRemove: (id: number) => void;
  locked: boolean;
}

export default function BillPanel({ items, totals, onRemove, locked }: Props) {
  const scope = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);

  // Base pizza = everything that isn't a topping; add-ons = the toppings.
  const baseSubtotal = items
    .filter((i) => i.layerType !== "TOPPING")
    .reduce((s, i) => s + i.price, 0);
  const addonsSubtotal = items
    .filter((i) => i.layerType === "TOPPING")
    .reduce((s, i) => s + i.price, 0);

  // Animated count-up on total
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const el = totalRef.current;
    if (!el) return;
    if (reduce) {
      el.textContent = `$${totals.price.toFixed(2)}`;
      prev.current = totals.price;
      return;
    }
    const proxy = { v: prev.current };
    gsap.to(proxy, {
      v: totals.price,
      duration: 0.45,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = `$${proxy.v.toFixed(2)}`;
      },
    });
    prev.current = totals.price;
  }, [totals.price]);

  return (
    <div
      ref={scope}
      className="forno-panel rounded-2xl p-4 flex flex-col gap-3 w-full"
    >
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse shadow-[0_0_8px_hsl(24_95%_53%)]" />
        <p className="text-[9.5px] font-mono uppercase tracking-[0.25em] text-ember/90">
          Live Total
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-cream/35 italic py-3 font-display">
          A blank canvas — start with a base.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 max-h-[130px] overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between text-xs gap-2"
            >
              <span className="text-cream/80 truncate">{item.name}</span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-cream/50 text-[10.5px] tabular-nums">
                  ${item.price.toFixed(2)}
                </span>
                {!locked && (
                  <button
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="w-4 h-4 rounded-full text-cream/30 hover:text-red-400 hover:bg-red-500/10 transition-colors text-[11px] leading-none focus:outline-none focus:ring-1 focus:ring-red-400"
                  >
                    ×
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Breakdown */}
      <div className="border-t border-cream/10 pt-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-cream/40">
            Base pizza
          </span>
          <span className="font-mono text-xs text-cream/70 tabular-nums">
            ${baseSubtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-cream/40">
            Add-ons
          </span>
          <span className="font-mono text-xs text-cream/70 tabular-nums">
            ${addonsSubtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-cream/40">
            Calories
          </span>
          <span className="font-mono text-xs text-cream/70 tabular-nums">
            {totals.calories} kcal
          </span>
        </div>
      </div>

      <div className="border-t border-dashed border-cream/15 pt-3 flex items-baseline justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cream/45">
          Current total
        </span>
        <span
          ref={totalRef}
          className="font-display text-[26px] font-semibold text-gradient-forno tabular-nums"
        >
          ${totals.price.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
