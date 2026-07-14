"use client";

import type { BuildStep } from "./PizzaBuilder";

interface Props {
  current: BuildStep;
  completed: Set<BuildStep>;
  onJump: (step: BuildStep) => void;
}

const STEPS: { id: BuildStep; label: string }[] = [
  { id: "DOUGH", label: "Dough" },
  { id: "SIZE", label: "Size" },
  { id: "SAUCE", label: "Sauce" },
  { id: "CHEESE", label: "Cheese" },
  { id: "TOPPINGS", label: "Toppings" },
  { id: "REVIEW", label: "Review" },
];

export default function BuildStepper({ current, completed, onJump }: Props) {
  return (
    <nav
      aria-label="Build progress"
      className="w-full forno-panel rounded-2xl px-4 py-2.5"
    >
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((step, i) => {
          const isCurrent = step.id === current;
          const isDone = completed.has(step.id) && !isCurrent;
          const isClickable = isDone;

          return (
            <li
              key={step.id}
              className="flex items-center flex-1 min-w-0 last:flex-initial"
            >
              <button
                type="button"
                onClick={() => isClickable && onJump(step.id)}
                disabled={!isClickable}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex items-center gap-2.5 min-w-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ember/70 rounded-xl px-1 py-1
                  ${isClickable ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300
                    ${isCurrent
                      ? "bg-gradient-to-b from-ember to-tomato text-void shadow-[0_0_18px_hsl(24_95%_53%/0.55)]"
                      : isDone
                        ? "bg-ember/15 text-ember border border-ember/40 group-hover:bg-ember/25"
                        : "bg-cream/5 text-cream/30 border border-cream/10"}`}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span
                  className={`hidden sm:inline text-[10.5px] font-mono uppercase tracking-[0.2em] truncate transition-colors
                    ${isCurrent ? "text-cream" : isDone ? "text-cream/55" : "text-cream/25"}`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={`flex-1 mx-1.5 sm:mx-2.5 h-px min-w-[8px] transition-colors duration-300
                    ${isDone ? "bg-ember/50" : "bg-cream/10"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
