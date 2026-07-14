"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import gsap from "gsap";
import Image from "next/image";
import { cutoutUrl } from "@/lib/pizza-assets";
import type { MenuItem } from "@/types";
import type { PizzaCanvasHandle } from "./PizzaCanvas";

interface Props {
  items: MenuItem[];
  selectedIds: Set<number>;
  onApply: (item: MenuItem) => void;
  /** Fires when a token is hovered/focused/tapped — drives the detail panel. */
  onFocus?: (item: MenuItem) => void;
  dropTargetRef: RefObject<PizzaCanvasHandle>;
  /** Diameter of the entire orbit ring (px). Items sit on a circle of this size. */
  ringSize?: number;
  /** Pixel size of each item tile. */
  tileSize?: number;
  /** Seconds for one full rotation. */
  rotationDuration?: number;
  /** Center content (the pizza canvas). */
  children?: ReactNode;
}

const DRAG_THRESHOLD = 6;

interface DragState {
  itemId: number;
  x: number;
  y: number;
  over: boolean;
  origin: { x: number; y: number };
}

export default function RotatingOrbit({
  items,
  selectedIds,
  onApply,
  onFocus,
  dropTargetRef,
  ringSize = 660,
  tileSize = 84,
  rotationDuration = 36,
  children,
}: Props) {
  const orbitRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const counterRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const tweens = useRef<{ orbit?: gsap.core.Tween; counters: gsap.core.Tween[] }>({
    counters: [],
  });
  const startPos = useRef<{ x: number; y: number; pointerId: number } | null>(
    null,
  );
  const wasDragging = useRef(false);
  const [drag, setDrag] = useState<DragState | null>(null);

  // Polar positions for each item — these stay fixed relative to the orbit container
  const positions = useMemo(() => {
    const r = ringSize / 2 - tileSize / 2;
    const n = items.length || 1;
    return items.map((_, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return {
        x: r * Math.cos(angle),
        y: r * Math.sin(angle),
      };
    });
  }, [items, ringSize, tileSize]);

  // Slow rotation of the orbit ring + counter-rotation of items so they stay upright
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce || !orbitRef.current) return;

    const ctx = gsap.context(() => {
      tweens.current.orbit = gsap.to(orbitRef.current!, {
        rotation: 360,
        duration: rotationDuration,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });
      tweens.current.counters = items
        .map((it) => counterRefs.current.get(it.id))
        .filter((el): el is HTMLSpanElement => !!el)
        .map((el) =>
          gsap.to(el, {
            rotation: -360,
            duration: rotationDuration,
            repeat: -1,
            ease: "none",
            transformOrigin: "50% 50%",
          }),
        );
    }, orbitRef);

    return () => {
      tweens.current.orbit?.kill();
      tweens.current.counters.forEach((t) => t.kill());
      tweens.current = { counters: [] };
      ctx.revert();
    };
  }, [items, rotationDuration]);

  // Pause/resume rotation when an item is being dragged
  useEffect(() => {
    if (drag) {
      tweens.current.orbit?.pause();
      tweens.current.counters.forEach((t) => t.pause());
    } else {
      tweens.current.orbit?.resume();
      tweens.current.counters.forEach((t) => t.resume());
    }
  }, [drag]);

  function isOverDrop(x: number, y: number) {
    const rect = dropTargetRef.current?.getBoundingClientRect();
    if (!rect) return false;
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  function onPointerDown(
    e: React.PointerEvent<HTMLButtonElement>,
    item: MenuItem,
  ) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const target = e.currentTarget;
    startPos.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    wasDragging.current = false;
    target.setPointerCapture(e.pointerId);

    // Capture the screen position the item is at right now (mid-rotation)
    const rect = target.getBoundingClientRect();
    setDrag({
      itemId: item.id,
      x: e.clientX,
      y: e.clientY,
      over: false,
      origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    });
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!startPos.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.hypot(dx, dy) >= DRAG_THRESHOLD) wasDragging.current = true;
    setDrag((prev) =>
      prev
        ? { ...prev, x: e.clientX, y: e.clientY, over: isOverDrop(e.clientX, e.clientY) }
        : null,
    );
  }

  function onPointerUp(
    e: React.PointerEvent<HTMLButtonElement>,
    item: MenuItem,
  ) {
    if (!startPos.current) return;
    try {
      e.currentTarget.releasePointerCapture(startPos.current.pointerId);
    } catch {
      /* no-op */
    }

    const over = isOverDrop(e.clientX, e.clientY);
    if (wasDragging.current) {
      if (over) onApply(item);
      // else: just drop the ghost, orbit resumes
    }
    setDrag(null);
    startPos.current = null;
  }

  function onPointerCancel() {
    setDrag(null);
    startPos.current = null;
    wasDragging.current = false;
  }

  function onClick(item: MenuItem) {
    if (wasDragging.current) {
      wasDragging.current = false;
      return;
    }
    onApply(item);
  }

  const dragItem = drag ? items.find((i) => i.id === drag.itemId) : undefined;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: ringSize, height: ringSize, maxWidth: "92vw" }}
    >
      {/* Orbit guide ring */}
      <div className="absolute inset-[18%] rounded-full border border-dashed border-ash/30 pointer-events-none" />

      {/* Center children (canvas) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">{children}</div>
      </div>

      {/* Rotating items wrapper */}
      <div
        ref={orbitRef}
        className="absolute inset-0 pointer-events-none"
      >
        {items.map((item, i) => {
          const pos = positions[i];
          const isSelected = selectedIds.has(item.id);
          const isDragging = drag?.itemId === item.id;
          return (
            <button
              key={item.id}
              ref={(el) => {
                if (el) itemRefs.current.set(item.id, el);
                else itemRefs.current.delete(item.id);
              }}
              type="button"
              onPointerDown={(e) => {
                onFocus?.(item);
                onPointerDown(e, item);
              }}
              onPointerMove={onPointerMove}
              onPointerUp={(e) => onPointerUp(e, item)}
              onPointerCancel={onPointerCancel}
              onPointerEnter={() => onFocus?.(item)}
              onFocus={() => onFocus?.(item)}
              onClick={() => onClick(item)}
              aria-pressed={isSelected}
              aria-label={`${item.name}, $${item.price.toFixed(2)} — drag onto pizza or tap to add`}
              className={`absolute pointer-events-auto outline-none focus-visible:ring-2 focus-visible:ring-ember flex flex-col items-center touch-none
                ${isDragging ? "opacity-0" : "opacity-100"}
                ${drag && !isDragging ? "pointer-events-none" : ""}`}
              style={{
                width: tileSize,
                left: "50%",
                top: "50%",
                transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`,
              }}
            >
              {/* Counter-rotate layer: GSAP owns this element's transform.
                  The parent button keeps its React inline translate untouched. */}
              <span
                ref={(el) => {
                  if (el) counterRefs.current.set(item.id, el);
                  else counterRefs.current.delete(item.id);
                }}
                className="flex flex-col items-center"
                style={{ width: tileSize }}
              >
                <span
                  className={`relative rounded-full border flex items-center justify-center transition-all duration-200 shrink-0 overflow-hidden backdrop-blur-md
                    ${isSelected
                      ? "border-ember/80 shadow-[0_0_26px_hsl(24_95%_53%/0.5)]"
                      : "border-cream/15 hover:border-ember/60 hover:shadow-[0_0_20px_hsl(24_95%_53%/0.3)]"}`}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    background:
                      "radial-gradient(circle at 50% 38%, hsl(30 12% 14% / 0.85), hsl(240 10% 5% / 0.9))",
                  }}
                >
                  <Image
                    src={cutoutUrl(item.imageUrl)}
                    alt=""
                    fill
                    sizes={`${tileSize}px`}
                    loading="eager"
                    className="object-contain p-2 pointer-events-none select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                  />
                  <span
                    className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold border whitespace-nowrap tabular-nums
                      ${isSelected
                        ? "bg-ember text-void border-ember"
                        : "bg-black/90 text-ember border-cream/15"}`}
                  >
                    ${item.price.toFixed(2)}
                  </span>
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-b from-ember to-tomato text-void text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_hsl(24_95%_53%/0.6)]">
                      ✓
                    </span>
                  )}
                </span>
                {/* Name label below the circle */}
                <span className="mt-1.5 text-[9px] font-mono uppercase tracking-wide text-cream/60 text-center leading-tight truncate w-full px-0.5 select-none">
                  {item.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Drag ghost (rendered as a fixed-position element) */}
      {drag && dragItem && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: drag.x,
            top: drag.y,
            transform: `translate(-50%, -50%) scale(${drag.over ? 1.18 : 1})`,
            transition: "transform 0.12s ease-out",
          }}
        >
          <div
            className={`relative rounded-full border overflow-hidden backdrop-blur-md
              ${drag.over ? "border-ember shadow-[0_0_30px_hsl(24_95%_53%/0.6)] scale-110" : "border-cream/25"}`}
            style={{
              width: tileSize,
              height: tileSize,
              background:
                "radial-gradient(circle at 50% 38%, hsl(30 12% 14% / 0.85), hsl(240 10% 5% / 0.9))",
            }}
          >
            <Image
              src={cutoutUrl(dragItem.imageUrl)}
              alt=""
              fill
              sizes={`${tileSize}px`}
              loading="eager"
              className="object-contain p-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
            />
          </div>
          {drag.over && (
            <p className="text-[9px] font-mono uppercase tracking-widest text-ember text-center mt-2">
              Release to add
            </p>
          )}
        </div>
      )}
    </div>
  );
}
