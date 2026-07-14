"use client";

import type { PizzaSize } from "./PizzaCanvas";

interface Props {
  size: PizzaSize;
  onChange: (size: PizzaSize) => void;
}

const OPTIONS: { id: PizzaSize; label: string; sub: string }[] = [
  { id: "SMALL", label: "Small", sub: "Personal" },
  { id: "MEDIUM", label: "Medium", sub: "Classic" },
  { id: "LARGE", label: "Large", sub: "Sharing" },
];

export default function SizeStep({ size, onChange }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 text-center animate-rise">
      <p className="text-[9.5px] font-mono uppercase tracking-[0.3em] text-cheese/80">
        Step 2 — Choose your size
      </p>
      <p className="text-sm text-cream/70 max-w-md leading-snug font-ui">
        Pinch or scroll on the pizza to resize — or pick a preset.
      </p>

      <div className="flex gap-2.5">
        {OPTIONS.map((opt) => {
          const isActive = opt.id === size;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              aria-pressed={isActive}
              className={`flex flex-col items-center gap-0.5 rounded-xl border px-5 py-2 transition-all duration-200
                ${isActive
                  ? "border-ember/70 bg-ember/12 shadow-[0_0_22px_hsl(24_95%_53%/0.28)]"
                  : "border-cream/10 bg-cream/[0.03] hover:border-ember/40 hover:bg-cream/[0.06]"}`}
            >
              <span
                className={`font-display text-base font-semibold ${isActive ? "text-ember" : "text-cream/90"}`}
              >
                {opt.label}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-cream/40">
                {opt.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
