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
  const totalRef = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);

  const baseSubtotal = items
    .filter((i) => i.layerType !== "TOPPING")
    .reduce((s, i) => s + i.price, 0);
  const addonsSubtotal = items
    .filter((i) => i.layerType === "TOPPING")
    .reduce((s, i) => s + i.price, 0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    <div className="w-full rounded-[1.95rem] border border-slate-300/14 bg-[linear-gradient(180deg,rgba(11,12,15,0.99),rgba(5,6,9,0.99))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_24px_54px_rgba(0,0,0,0.44)] flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-ember shadow-[0_0_8px_hsl(24_95%_53%)]" />
        <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-ember/90">
          Live Total
        </p>
      </div>

      {items.length === 0 ? (
        <p className="py-3 font-ui text-sm text-[#dce6ff]/50">
          A blank canvas. Start with a base.
        </p>
      ) : (
        <ul className="flex max-h-[130px] flex-col gap-2.5 overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="truncate font-ui text-[#eef2ff]/80">
                {item.name}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-[11px] tabular-nums text-[#eef2ff]/48">
                  ${item.price.toFixed(2)}
                </span>
                {!locked && (
                  <button
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="h-4 w-4 rounded-full text-[11px] leading-none text-white/28 transition-colors hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                  >
                    ×
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 border-t border-white/8 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#5c76ad]">
            Base Pizza
          </span>
          <span className="font-ui text-[0.96rem] font-semibold tabular-nums text-[#eef2ff]">
            ${baseSubtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#5c76ad]">
            Add-ons
          </span>
          <span className="font-ui text-[0.96rem] font-semibold tabular-nums text-[#eef2ff]">
            ${addonsSubtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#5c76ad]">
            Calories
          </span>
          <span className="font-ui text-[0.96rem] font-semibold tabular-nums text-[#eef2ff]">
            {totals.calories} kcal
          </span>
        </div>
      </div>

      <div className="flex items-baseline justify-between border-t border-dashed border-white/10 pt-4">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#5c76ad]">
          Current Total
        </span>
        <span
          ref={totalRef}
          className="font-ui text-[2rem] font-light leading-none tabular-nums text-[#ffc07f]"
        >
          ${totals.price.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
