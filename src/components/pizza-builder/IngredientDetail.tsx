"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import { cutoutUrl } from "@/lib/pizza-assets";
import { SIZE_LABELS, SIZE_META, type PizzaSize } from "@/lib/pizza-size";
import type { MenuItem } from "@/types";

interface Props {
  /** Focused / most-relevant ingredient for the current step. */
  item: MenuItem | null;
  /** When true, shows the pizza size card instead of an ingredient. */
  sizeMode: boolean;
  size: PizzaSize;
}

const LAYER_KICKER: Record<string, string> = {
  BASE: "The Base",
  SAUCE: "The Sauce",
  CHEESE: "The Cheese",
  TOPPING: "Topping",
};

function highlight(item: MenuItem): string {
  if (item.protein >= 8) return "High protein";
  if (item.calories <= 45) return "Light & fresh";
  if (item.layerType === "CHEESE") return "Stretchy & rich";
  if (item.layerType === "SAUCE") return "Signature spread";
  return "House favourite";
}

export default function IngredientDetail({ item, sizeMode, size }: Props) {
  const scope = useRef<HTMLDivElement>(null);

  // Re-animate the card whenever the focused ingredient (or size) changes.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !scope.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".detail-anim",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" },
      );
    }, scope);
    return () => ctx.revert();
  }, [item?.id, sizeMode, size]);

  // ── Size card ───────────────────────────────────────────────────────────
  if (sizeMode) {
    const meta = SIZE_META[size];
    return (
      <div ref={scope} className="forno-panel rounded-2xl p-5">
        <p className="detail-anim text-[9px] font-mono uppercase tracking-[0.3em] text-cream/40 mb-3">
          Current selection
        </p>
        <p className="detail-anim font-display text-4xl font-semibold text-gradient-forno leading-none mb-1">
          {SIZE_LABELS[size]}
        </p>
        <p className="detail-anim font-mono text-xs text-cream/50 mb-5">
          {meta.diameter} diameter · {meta.feeds}
        </p>
        <div className="detail-anim h-px bg-cream/10 mb-4" />
        <dl className="detail-anim flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-cream/40">
              Diameter
            </dt>
            <dd className="font-display text-lg text-cream">{meta.diameter}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-cream/40">
              Serves
            </dt>
            <dd className="font-ui text-sm text-cream/80">{meta.feeds}</dd>
          </div>
        </dl>
      </div>
    );
  }

  // ── Empty / prompt state ────────────────────────────────────────────────
  if (!item) {
    return (
      <div className="forno-panel rounded-2xl p-5 flex flex-col justify-center min-h-[220px]">
        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-cream/40 mb-2">
          Ingredient
        </p>
        <p className="font-display text-lg text-cream/50 italic leading-snug">
          Hover a token to see the details.
        </p>
      </div>
    );
  }

  // ── Ingredient card ─────────────────────────────────────────────────────
  const isBase = item.layerType === "BASE";
  return (
    <div ref={scope} className="forno-panel rounded-2xl p-5">
      <div className="detail-anim flex items-center gap-3 mb-3">
        <span
          className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-cream/15"
          style={{
            background:
              "radial-gradient(circle at 50% 38%, hsl(30 12% 16% / 0.9), hsl(240 10% 6%))",
          }}
        >
          <Image
            src={cutoutUrl(item.imageUrl)}
            alt=""
            fill
            sizes="44px"
            loading="eager"
            className="object-contain p-1.5"
          />
        </span>
        <p className="text-[9px] font-mono uppercase tracking-[0.28em] text-cheese/80">
          {LAYER_KICKER[item.layerType] ?? "Ingredient"}
        </p>
      </div>

      <p className="detail-anim font-display text-2xl font-semibold text-cream leading-tight mb-4">
        {item.name}
      </p>

      <div className="detail-anim h-px bg-cream/10 mb-4" />

      <dl className="detail-anim flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-cream/40">
            Nutrition
          </dt>
          <dd className="font-display text-base text-cream tabular-nums">
            {item.calories} kcal
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-cream/40">
            Highlight
          </dt>
          <dd className="font-ui text-sm text-cream/80">{highlight(item)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-cream/40">
            {isBase ? "Base price" : "Add-on price"}
          </dt>
          <dd className="font-mono text-sm text-ember tabular-nums">
            ${item.price.toFixed(2)}
            {!isBase && (
              <span className="text-cream/40 text-[10px] ml-1">add-on</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
