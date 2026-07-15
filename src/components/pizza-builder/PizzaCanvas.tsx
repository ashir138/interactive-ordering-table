"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import gsap from "gsap";
import Image from "next/image";
import { assignZIndexes } from "@/lib/layer-rules";
import { cutoutUrl } from "@/lib/pizza-assets";
import type { MenuItem, LayerType } from "@/types";

export type PizzaSize = "SMALL" | "MEDIUM" | "LARGE";

// Per-layer-type placement for a photoreal stacked pizza.
// Layers use transparent-background cutout PNGs (see cutoutUrl) rendered in full
// colour — no blend tricks, so sauce/cheese show through the gaps between toppings.
// `object-cover` lets each layer spread edge-to-edge; toppings get a per-item
// rotation so multiple layers interleave instead of aligning identically.
// Toppings sit at a larger inset than sauce/cheese so the whole 12-piece photo
// renders a little smaller and tucks inside the pizza rather than reaching the
// crust — pieces stay intact, just scaled down to fit the pie.
const LAYER_CONFIG: Record<LayerType, { inset: string }> = {
  BASE:    { inset: "0%" },
  SAUCE:   { inset: "7%" },
  CHEESE:  { inset: "8%" },
  TOPPING: { inset: "16%" },
};

/** Deterministic angle per topping so stacked toppings don't align identically. */
function toppingAngle(id: number): number {
  return (id * 47) % 360;
}

function layerScale(item: MenuItem): number {
  const image = item.imageUrl.toLowerCase();
  if (image.includes("/sauces/bbq")) return 1.16;
  if (image.includes("/cheese/mozzarella")) return 1.28;
  return 1;
}

const SIZE_SCALE: Record<PizzaSize, number> = {
  SMALL: 0.78,
  MEDIUM: 0.92,
  LARGE: 1,
};

interface Props {
  layers: MenuItem[];
  size?: PizzaSize;
  glow?: boolean;
  /** Outer diameter of the pizza dish in px. Falls back to 440 for legacy callers. */
  diameter?: number;
  /** Show dotted 8-slice cutter guides over the dish (used on the size step). */
  sliceGuides?: boolean;
  /** Enables horizontal swipe on the canvas. -1 = swipe left (next), 1 = swipe right (prev) */
  onSwipe?: (dir: -1 | 1) => void;
  /** Enables pinch + wheel resize. -1 = shrink, 1 = grow */
  onPinch?: (delta: -1 | 1) => void;
  /** Show overlay arrow indicators when swipe is enabled */
  swipeHint?: { left: string; right: string };
}

export interface PizzaCanvasHandle {
  getBoundingClientRect: () => DOMRect | undefined;
}

const SWIPE_THRESHOLD = 60; // px horizontal travel to register a swipe
const WHEEL_THRESHOLD = 80; // accumulated deltaY to trigger size jump
const PINCH_THRESHOLD = 1.25; // ratio of pinch distance to trigger size jump

const PizzaCanvas = forwardRef<PizzaCanvasHandle, Props>(function PizzaCanvas(
  { layers, size = "MEDIUM", glow = false, diameter = 440, sliceGuides = false, onSwipe, onPinch, swipeHint },
  forwardedRef,
) {
  const dishRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const knownIds = useRef<Set<number>>(new Set());

  useImperativeHandle(forwardedRef, () => ({
    getBoundingClientRect: () => dishRef.current?.getBoundingClientRect(),
  }));

  const stacked = assignZIndexes(layers);
  const scale = SIZE_SCALE[size];

  // Animate freshly-mounted layers in. Existing layers persist visually.
  useLayoutEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const presentIds = new Set(stacked.map((s) => s.id));

    stacked.forEach((item) => {
      if (knownIds.current.has(item.id)) return;
      const el = layerRefs.current.get(item.id);
      if (!el) return;

      if (reduce) {
        gsap.set(el, { opacity: 1, scale: 1, y: 0, rotate: 0 });
      } else {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.55, y: -24, rotate: -8 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            rotate: 0,
            duration: 0.55,
            ease: "back.out(1.6)",
          },
        );
      }
      knownIds.current.add(item.id);
    });

    knownIds.current.forEach((id) => {
      if (!presentIds.has(id)) knownIds.current.delete(id);
    });
  }, [stacked]);

  // Subtle glow pulse on REVIEW step
  useEffect(() => {
    if (!glow || !dishRef.current) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const tween = gsap.to(dishRef.current, {
      boxShadow:
        "0 30px 90px -10px rgba(255,107,53,0.5), 0 0 60px rgba(255,193,76,0.25)",
      duration: 1.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, [glow]);

  // ── Swipe (single-pointer horizontal drag) ────────────────────────────────
  useEffect(() => {
    if (!onSwipe || !dishRef.current) return;
    const el = dishRef.current;

    let startX: number | null = null;
    let pointerId: number | null = null;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      startX = e.clientX;
      pointerId = e.pointerId;
    };
    const onUp = (e: PointerEvent) => {
      if (startX === null || pointerId !== e.pointerId) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        onSwipe(dx > 0 ? 1 : -1);
        // Slide animation hint
        gsap.fromTo(
          el,
          { x: dx > 0 ? -20 : 20 },
          { x: 0, duration: 0.4, ease: "back.out(1.6)" },
        );
      }
      startX = null;
      pointerId = null;
    };
    const onCancel = () => {
      startX = null;
      pointerId = null;
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
    };
  }, [onSwipe]);

  // ── Pinch (two-pointer) + Wheel resize ────────────────────────────────────
  useEffect(() => {
    if (!onPinch || !dishRef.current) return;
    const el = dishRef.current;

    const pointers = new Map<number, { x: number; y: number }>();
    let initialDist: number | null = null;
    let wheelAccum = 0;
    let wheelTimer: ReturnType<typeof setTimeout> | null = null;

    const distance = () => {
      const arr = Array.from(pointers.values());
      if (arr.length < 2) return 0;
      const dx = arr[0].x - arr[1].x;
      const dy = arr[0].y - arr[1].y;
      return Math.hypot(dx, dy);
    };

    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) initialDist = distance();
    };
    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2 && initialDist) {
        const cur = distance();
        const ratio = cur / initialDist;
        if (ratio >= PINCH_THRESHOLD) {
          onPinch(1);
          initialDist = cur;
        } else if (ratio <= 1 / PINCH_THRESHOLD) {
          onPinch(-1);
          initialDist = cur;
        }
      }
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) initialDist = null;
    };

    const onWheel = (e: WheelEvent) => {
      if (!onPinch) return;
      e.preventDefault();
      wheelAccum += e.deltaY;
      if (wheelTimer) clearTimeout(wheelTimer);
      if (Math.abs(wheelAccum) >= WHEEL_THRESHOLD) {
        onPinch(wheelAccum < 0 ? 1 : -1); // scroll up = grow
        wheelAccum = 0;
      } else {
        wheelTimer = setTimeout(() => {
          wheelAccum = 0;
        }, 200);
      }
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      if (wheelTimer) clearTimeout(wheelTimer);
    };
  }, [onPinch]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: diameter,
        height: diameter,
        maxWidth: "92vw",
        maxHeight: "92vw",
      }}
    >
      {/* Warm overhead spotlight pooled behind the pie */}
      <div
        className="forno-spotlight animate-spot absolute rounded-full pointer-events-none"
        style={{ inset: "-14%", zIndex: 0 }}
      />

      {/* Dark stone serving board */}
      <div
        className="forno-board absolute rounded-full pointer-events-none"
        style={{ inset: "-6%", zIndex: 0 }}
      />

      {/* Soft floor shadow the pie casts on the board */}
      <div
        className="absolute rounded-[50%] pointer-events-none"
        style={{
          bottom: "-3%",
          width: "78%",
          height: "12%",
          zIndex: 0,
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, transparent 72%)",
          filter: "blur(6px)",
        }}
      />

      <div
        ref={dishRef}
        className={`relative w-full h-full rounded-full isolate flex items-center justify-center overflow-hidden transition-transform duration-500
          ${onSwipe || onPinch ? "touch-none cursor-grab active:cursor-grabbing" : ""}`}
        style={{ transform: `scale(${scale})`, zIndex: 1 }}
        aria-label="Pizza preview"
        role="img"
        data-pizza-canvas
      >
        {/* Warm dough-toned disc so the pie reads even before a base is chosen */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 42%, hsl(36 45% 30%) 0%, hsl(28 40% 18%) 60%, hsl(24 35% 12%) 100%)",
          }}
        />

        {/* Empty hint */}
        {layers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <p className="text-[11px] font-mono uppercase tracking-[0.4em] text-cream/50 text-center leading-relaxed">
              Choose
              <br />a base
            </p>
          </div>
        )}

        {/* Stacked layers — full-colour transparent cutouts, opacity via GSAP */}
        {stacked.map((item) => {
          const cfg = LAYER_CONFIG[item.layerType] ?? LAYER_CONFIG.TOPPING;
          const inset = cfg.inset;
          const isTopping = item.layerType === "TOPPING";
          const imageFit = isTopping ? "object-contain" : "object-cover";
          const scaleFactor = layerScale(item);
          const baseTransform = isTopping
            ? `rotate(${toppingAngle(item.id)}deg)`
            : "";
          const scaleTransform = scaleFactor !== 1 ? ` scale(${scaleFactor})` : "";
          return (
            <div
              key={item.id}
              ref={(el) => {
                if (el) layerRefs.current.set(item.id, el);
                else layerRefs.current.delete(item.id);
              }}
              className="absolute"
              style={{
                top: inset,
                left: inset,
                right: inset,
                bottom: inset,
                zIndex: item.zIndex,
                transform: `${baseTransform}${scaleTransform}`.trim() || undefined,
                transformOrigin: "50% 50%",
                filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))",
              }}
            >
              <Image
                src={cutoutUrl(item.imageUrl)}
                alt={`${item.name} layer`}
                fill
                sizes={`${diameter}px`}
                className={`${imageFit} rounded-full pointer-events-none select-none`}
                loading="eager"
              />
            </div>
          );
        })}

        {/* Dotted 8-slice cutter guides (size step) */}
        {sliceGuides && layers.length > 0 && (
          <svg
            className="absolute inset-[9%] pointer-events-none z-30 opacity-70"
            viewBox="0 0 100 100"
            aria-hidden
          >
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={50}
                  y1={50}
                  x2={50 + 50 * Math.cos(a)}
                  y2={50 + 50 * Math.sin(a)}
                  stroke="hsl(8 75% 55%)"
                  strokeWidth={0.5}
                  strokeDasharray="1.5 2"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        )}

        {/* Oven-baked char + warm rim baked into the crust edge */}
        <div className="forno-char absolute inset-0 rounded-full pointer-events-none z-40" />

        {/* Glossy overhead highlight */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none z-40"
          style={{
            background:
              "radial-gradient(ellipse 55% 40% at 42% 24%, hsl(45 100% 85% / 0.14) 0%, transparent 60%)",
          }}
        />

        {/* Swipe hint overlay arrows */}
        {onSwipe && swipeHint && (
          <>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-[9px] font-mono uppercase tracking-[0.3em] text-cream/60 pointer-events-none">
              swipe to switch
            </p>
          </>
        )}
      </div>
    </div>
  );
});

export default PizzaCanvas;
