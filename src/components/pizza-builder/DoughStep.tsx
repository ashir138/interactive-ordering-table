"use client";

import type { MenuItem } from "@/types";

interface Props {
  bases: MenuItem[];
  selectedId: number | null;
}

export default function DoughStep({ bases, selectedId }: Props) {
  const idx = bases.findIndex((b) => b.id === selectedId);

  return (
    <div className="flex flex-col items-center gap-2 text-center animate-rise">
      <p className="text-[9.5px] font-mono uppercase tracking-[0.3em] text-cheese/80">
        Step 1 — Choose your dough
      </p>
      <p className="text-sm text-cream/70 max-w-md leading-snug font-ui">
        Swipe the pizza (or use the arrows) to flip through the crusts.
      </p>

      <div className="flex gap-1.5 mt-0.5">
        {bases.map((b, i) => (
          <span
            key={b.id}
            className={`h-1.5 rounded-full transition-all duration-300
              ${i === idx ? "w-5 bg-ember" : "w-1.5 bg-cream/20"}`}
          />
        ))}
      </div>

      {selectedId !== null && bases[idx] && (
        <p className="font-display text-lg font-semibold text-cream">
          {bases[idx].name}
          <span className="text-ember font-mono text-xs ml-2 align-middle">
            ${bases[idx].price.toFixed(2)}
          </span>
        </p>
      )}
    </div>
  );
}
