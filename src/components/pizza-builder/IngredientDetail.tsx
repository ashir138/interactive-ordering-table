"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SIZE_META, type PizzaSize } from "@/lib/pizza-size";
import type { MenuItem, NutritionTotals } from "@/types";

interface Props {
  item: MenuItem | null;
  sizeMode: boolean;
  size: PizzaSize;
  totals: NutritionTotals;
  ingredientCount: number;
}

const LAYER_KICKER: Record<string, string> = {
  BASE: "Base",
  SAUCE: "Sauce",
  CHEESE: "Cheese",
  TOPPING: "Topping",
};

function highlight(item: MenuItem): string {
  if (item.protein >= 8) return "High protein";
  if (item.calories <= 45) return "Light and fresh";
  if (item.layerType === "CHEESE") return "Stretchy and rich";
  if (item.layerType === "SAUCE") return "Signature spread";
  return "House favourite";
}

function DetailShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[1.45rem] border border-slate-300/14 bg-[linear-gradient(180deg,rgba(11,12,15,0.99),rgba(5,6,9,0.99))] px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_18px_38px_rgba(0,0,0,0.4)]">
      {children}
    </div>
  );
}

function Label({ children, align = "right" }: { children: React.ReactNode; align?: "right" | "left" }) {
  return (
    <p
      className={`text-[9px] font-mono uppercase tracking-[0.3em] text-[#5c76ad] ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </p>
  );
}

function StatRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[9px] font-mono uppercase tracking-[0.16em] text-[#5c76ad]">
        {label}
      </dt>
      <dd className="font-ui text-[0.84rem] font-semibold text-[#eef2ff] tabular-nums text-right">
        {value}
      </dd>
    </div>
  );
}

export default function IngredientDetail({
  item,
  sizeMode,
  size,
  totals,
  ingredientCount,
}: Props) {
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !scope.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".detail-anim",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" },
      );
    }, scope);
    return () => ctx.revert();
  }, [item?.id, sizeMode, size]);

  if (sizeMode) {
    const meta = SIZE_META[size];
    const diameterValue = parseFloat(meta.diameter.replace(/"/g, ""));
    const surfaceArea = Math.PI * Math.pow(diameterValue / 2, 2);
    const energyDensity = totals.calories > 0 ? totals.calories / surfaceArea : 0;

    return (
      <div ref={scope} className="w-full max-w-[240px]">
        <DetailShell>
          <div className="detail-anim flex flex-col items-end">
            <Label>Size</Label>
            <p className="mt-1 font-ui text-[1.7rem] font-semibold uppercase leading-none text-[#edf2ff] tabular-nums tracking-[0.01em]">
              {diameterValue.toFixed(1)}&quot;
            </p>
          </div>

          <div className="detail-anim mt-3.5 flex flex-col items-end">
            <Label>Price</Label>
            <p className="mt-1 font-ui text-[1.7rem] font-light leading-none text-[#ffc07f] tabular-nums">
              ${totals.price.toFixed(2)}
            </p>
          </div>

          <div className="detail-anim mt-3.5 flex flex-col items-end">
            <Label>Total Ingredients</Label>
            <p className="mt-0.5 font-ui text-[0.92rem] font-semibold text-[#eef2ff] tabular-nums">
              {ingredientCount}
            </p>
            <p className="mt-2 text-[9px] font-mono uppercase tracking-[0.24em] text-[#5c76ad]">
              Calories
            </p>
            <p className="mt-0.5 font-ui text-[1.4rem] font-semibold leading-none text-[#dce6ff] tabular-nums">
              {totals.calories} kcal
            </p>
          </div>

          <div className="detail-anim mt-3.5 h-px bg-white/8" />

          <dl className="detail-anim mt-3 flex flex-col gap-1.5">
            <StatRow label="Surface Area" value={`${surfaceArea.toFixed(0)} sq in`} />
            <StatRow label="Fermentation" value="20h" />
            <StatRow label="Energy Density" value={`${energyDensity.toFixed(1)} kcal/in^2`} />
          </dl>
        </DetailShell>
      </div>
    );
  }

  if (!item) {
    return (
      <div ref={scope} className="w-full max-w-[240px]">
        <DetailShell>
          <div className="detail-anim min-h-[165px] flex flex-col justify-between">
            <div>
              <Label align="left">Ingredient</Label>
              <p className="mt-2.5 font-ui text-[1.3rem] font-semibold uppercase leading-tight tracking-[0.02em] text-[#eef2ff]">
                Waiting for selection
              </p>
            </div>

            <div>
              <div className="h-px bg-white/8" />
              <p className="mt-3 text-[0.82rem] text-[#dce6ff]/65">
                Hover or tap an ingredient token to preview its details here.
              </p>
            </div>
          </div>
        </DetailShell>
      </div>
    );
  }

  const isBase = item.layerType === "BASE";

  return (
      <div ref={scope} className="w-full max-w-[240px]">
        <DetailShell>
        <div className="detail-anim flex items-start justify-between gap-3">
          <div>
            <Label align="left">{LAYER_KICKER[item.layerType] ?? "Ingredient"}</Label>
            <p className="mt-1.5 font-ui text-[1.2rem] font-semibold uppercase leading-[1.05] tracking-[0.015em] text-[#eef2ff]">
              {item.name}
            </p>
          </div>
        </div>

        <div className="detail-anim mt-3.5 flex flex-col items-end">
          <Label>Price</Label>
          <p className="mt-1 font-ui text-[1.5rem] font-light leading-none text-[#ffc07f] tabular-nums">
            ${item.price.toFixed(2)}
          </p>
        </div>

        <div className="detail-anim mt-3.5 flex flex-col items-end">
          <Label>Calories</Label>
          <p className="mt-0.5 font-ui text-[1.35rem] font-semibold leading-none text-[#dce6ff] tabular-nums">
            {item.calories} kcal
          </p>
        </div>

        <div className="detail-anim mt-3.5 h-px bg-white/8" />

        <dl className="detail-anim mt-3 flex flex-col gap-1.5">
          <StatRow label="Type" value={LAYER_KICKER[item.layerType] ?? "Ingredient"} />
          <StatRow label="Highlight" value={highlight(item)} />
          <StatRow
            label={isBase ? "Pricing" : "Mode"}
            value={isBase ? "Base included" : "Add-on"}
          />
        </dl>
      </DetailShell>
    </div>
  );
}
