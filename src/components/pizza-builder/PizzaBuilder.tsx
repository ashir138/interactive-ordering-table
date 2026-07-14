"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addLayer, hasBase, removeLayer } from "@/lib/layer-rules";
import { computeTotals } from "@/lib/nutrition";
import { getSocket, disconnectSocket } from "@/lib/socket-client";
import { trackEvent } from "@/lib/posthog";
import type {
  ApiResponse,
  MenuItem,
  Order,
  OrderStatus,
} from "@/types";

import PizzaCanvas, {
  type PizzaCanvasHandle,
  type PizzaSize,
} from "./PizzaCanvas";
import RotatingOrbit from "./RotatingOrbit";
import BuildStepper from "./BuildStepper";
import DoughStep from "./DoughStep";
import SizeStep from "./SizeStep";
import OrbitStep from "./OrbitStep";
import ReviewStep from "./ReviewStep";
import IngredientDetail from "./IngredientDetail";
import BillPanel from "./BillPanel";
import IntroOverlay from "./IntroOverlay";
import WaitingPhase from "./WaitingPhase";
import ServedPhase from "./ServedPhase";

export type BuildStep =
  | "DOUGH"
  | "SIZE"
  | "SAUCE"
  | "CHEESE"
  | "TOPPINGS"
  | "REVIEW";

const BUILD_STEPS: BuildStep[] = [
  "DOUGH",
  "SIZE",
  "SAUCE",
  "CHEESE",
  "TOPPINGS",
  "REVIEW",
];

const SIZE_ORDER: PizzaSize[] = ["SMALL", "MEDIUM", "LARGE"];

function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Tracks an element's rendered size so the pizza/orbit can fit the available box.
 * Measures synchronously on mount (works even when the tab is occluded/throttled),
 * then keeps up to date via ResizeObserver + window resize.
 */
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize((prev) =>
        Math.abs(prev.width - r.width) < 1 && Math.abs(prev.height - r.height) < 1
          ? prev
          : { width: r.width, height: r.height },
      );
    };
    measure();
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  return [ref, size] as const;
}

interface Props {
  tableId: string;
}

type Combo = { ingredients: MenuItem[]; count: number };

export default function PizzaBuilder({ tableId }: Props) {
  const tableNum = parseInt(tableId, 10) || 1;

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MenuItem[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [combo, setCombo] = useState<Combo | null>(null);
  const [comboDismissed, setComboDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const [buildStep, setBuildStep] = useState<BuildStep>("DOUGH");
  const [pizzaSize, setPizzaSize] = useState<PizzaSize>("MEDIUM");
  const [focusedItem, setFocusedItem] = useState<MenuItem | null>(null);

  const canvasRef = useRef<PizzaCanvasHandle>(null);
  const [canvasAreaRef, canvasAreaSize] = useElementSize<HTMLDivElement>();

  // Fetch menu
  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((res: ApiResponse<MenuItem[]>) => {
        if (res.success) setMenu(res.data.filter((m) => m.isAvailable));
        else setMenuError("Failed to load menu.");
      })
      .catch(() => setMenuError("Failed to load menu."));
  }, []);

  // Fetch combo
  useEffect(() => {
    fetch("/api/menu/famous-combo")
      .then((r) => r.json())
      .then((res: ApiResponse<Combo | null>) => {
        if (res.success && res.data) setCombo(res.data);
      })
      .catch(() => {});
  }, []);

  // Socket
  useEffect(() => {
    if (!orderId) return;
    const socket = getSocket();
    const joinRoom = () => socket.emit("join-table", tableNum);
    const handler = ({
      orderId: incoming,
      status,
    }: {
      orderId: number;
      status: OrderStatus;
    }) => {
      if (incoming === orderId) {
        setOrderStatus(status);
        trackEvent("order_status_received", { order_id: incoming, status, table_id: tableNum });
      }
    };
    joinRoom();
    socket.on("connect", joinRoom);
    socket.on("order-status-update", handler);
    return () => {
      socket.off("connect", joinRoom);
      socket.off("order-status-update", handler);
      socket.emit("leave-table", tableNum);
    };
  }, [orderId, tableNum]);

  useEffect(() => () => disconnectSocket(), []);

  // Reset the focused ingredient when the step changes so the detail panel
  // falls back to that step's default.
  useEffect(() => {
    setFocusedItem(null);
  }, [buildStep]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const out: Record<"BASE" | "SAUCE" | "CHEESE" | "TOPPING", MenuItem[]> = {
      BASE: [],
      SAUCE: [],
      CHEESE: [],
      TOPPING: [],
    };
    menu.forEach((m) => {
      out[m.layerType].push(m);
    });
    return out;
  }, [menu]);

  const selectedBase = selected.find((s) => s.layerType === "BASE");
  const selectedSauce = selected.find((s) => s.layerType === "SAUCE");
  const selectedCheese = selected.find((s) => s.layerType === "CHEESE");
  const selectedToppings = useMemo(
    () => selected.filter((s) => s.layerType === "TOPPING"),
    [selected],
  );

  const totals = useMemo(() => computeTotals(selected), [selected]);
  const baseSelected = hasBase(selected);

  // Fit the pizza + orbit to the available canvas area so the nav stays on screen.
  const hasOrbit =
    buildStep === "SAUCE" ||
    buildStep === "CHEESE" ||
    buildStep === "TOPPINGS";
  const fit = Math.min(canvasAreaSize.width || 0, canvasAreaSize.height || 0);
  const ringSize = clamp(300, Math.round(fit - 6), 760);
  const orbitTile = clamp(56, Math.round(ringSize * 0.126), 96);
  // The pizza is the hero — take as much of the available box as possible.
  const canvasDiameter = hasOrbit
    ? Math.round(ringSize * 0.72)
    : fit > 0
      ? clamp(300, Math.round(fit * 0.98), 660)
      : 380;

  // Which ingredient the left detail panel describes: whatever is hovered/focused,
  // else a sensible default for the current step.
  const stepDefaultItem: MenuItem | null =
    buildStep === "DOUGH"
      ? selectedBase ?? null
      : buildStep === "SAUCE"
        ? selectedSauce ?? grouped.SAUCE[0] ?? null
        : buildStep === "CHEESE"
          ? selectedCheese ?? grouped.CHEESE[0] ?? null
          : buildStep === "TOPPINGS"
            ? selectedToppings[selectedToppings.length - 1] ??
              grouped.TOPPING[0] ??
              null
            : null;
  const detailItem = focusedItem ?? stepDefaultItem;
  const canPlace =
    baseSelected && !!selectedSauce && !!selectedCheese && !placing;

  const completedSteps = useMemo(() => {
    const s = new Set<BuildStep>();
    if (selectedBase) {
      s.add("DOUGH");
      s.add("SIZE");
    }
    if (selectedSauce) s.add("SAUCE");
    if (selectedCheese) s.add("CHEESE");
    if (selectedSauce && selectedCheese) s.add("TOPPINGS");
    return s;
  }, [selectedBase, selectedSauce, selectedCheese]);

  const selectedIdsByLayer = useMemo(() => {
    return {
      BASE: new Set(selected.filter((s) => s.layerType === "BASE").map((s) => s.id)),
      SAUCE: new Set(selected.filter((s) => s.layerType === "SAUCE").map((s) => s.id)),
      CHEESE: new Set(selected.filter((s) => s.layerType === "CHEESE").map((s) => s.id)),
      TOPPING: new Set(selected.filter((s) => s.layerType === "TOPPING").map((s) => s.id)),
    };
  }, [selected]);

  // ── Selection actions ─────────────────────────────────────────────────────
  function applyIngredient(item: MenuItem) {
    if (orderId) return;
    setError(null);
    setSelected((prev) => {
      if (item.layerType === "TOPPING") {
        const exists = prev.some((p) => p.id === item.id);
        return exists ? removeLayer(prev, item.id) : addLayer(prev, item);
      }
      const same = prev.find(
        (p) => p.layerType === item.layerType && p.id === item.id,
      );
      if (same) return removeLayer(prev, item.id);
      return addLayer(prev, item);
    });
  }

  function removeById(id: number) {
    if (orderId) return;
    setSelected((prev) => removeLayer(prev, id));
  }

  function applyCombo() {
    if (orderId || !combo) return;
    const ids = combo.ingredients.map((i) => i.id);
    const items = menu.filter((m) => ids.includes(m.id));
    const ordered: MenuItem[] = [];
    (["BASE", "SAUCE", "CHEESE", "TOPPING"] as const).forEach((lt) => {
      items.filter((i) => i.layerType === lt).forEach((i) => ordered.push(i));
    });
    setSelected(ordered);
    setPizzaSize("MEDIUM");
    setComboDismissed(true);
    setError(null);
    setBuildStep("REVIEW");
  }

  // Cycle dough via swipe (or arrow click)
  function cycleDough(dir: -1 | 1) {
    if (orderId || grouped.BASE.length === 0) return;
    const current = selectedBase
      ? grouped.BASE.findIndex((b) => b.id === selectedBase.id)
      : -1;
    const next =
      current < 0
        ? 0
        : (current + (dir > 0 ? 1 : -1) + grouped.BASE.length) %
          grouped.BASE.length;
    const target = grouped.BASE[next];
    if (!target) return;
    setSelected((prev) => {
      const without = prev.filter((p) => p.layerType !== "BASE");
      return [target, ...without];
    });
  }

  // Adjust size via pinch / scroll
  function bumpSize(delta: -1 | 1) {
    if (orderId) return;
    const idx = SIZE_ORDER.indexOf(pizzaSize);
    const next = Math.max(0, Math.min(SIZE_ORDER.length - 1, idx + delta));
    if (next !== idx) setPizzaSize(SIZE_ORDER[next]);
  }

  // ── Step navigation ───────────────────────────────────────────────────────
  function canAdvance(from: BuildStep): boolean {
    switch (from) {
      case "DOUGH":
        return !!selectedBase;
      case "SIZE":
        return !!selectedBase;
      case "SAUCE":
        return !!selectedSauce;
      case "CHEESE":
        return !!selectedCheese;
      case "TOPPINGS":
        return true;
      case "REVIEW":
        return canPlace;
    }
  }

  function goNext() {
    const idx = BUILD_STEPS.indexOf(buildStep);
    if (idx < 0 || idx >= BUILD_STEPS.length - 1) return;
    if (!canAdvance(buildStep)) return;
    setBuildStep(BUILD_STEPS[idx + 1]);
  }

  function goBack() {
    const idx = BUILD_STEPS.indexOf(buildStep);
    if (idx <= 0) return;
    setBuildStep(BUILD_STEPS[idx - 1]);
  }

  function jumpTo(step: BuildStep) {
    if (orderId) return;
    if (completedSteps.has(step) || step === buildStep) {
      setBuildStep(step);
    }
  }

  // ── Order ─────────────────────────────────────────────────────────────────
  async function placeOrder() {
    if (!canPlace) return;
    setPlacing(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: tableNum,
          layers: selected.map((s) => s.id),
        }),
      });
      const data: ApiResponse<Order> = await res.json();
      if (data.success) {
        setOrderId(data.data.id);
        setOrderStatus("NEW");
        trackEvent("order_placed", {
          table_id: tableNum,
          order_id: data.data.id,
          size: pizzaSize,
          layer_count: selected.length,
          total_price: data.data.totalPrice,
          total_cals: data.data.totalCals,
        });
      } else {
        setError(data.errors?.join(" • ") ?? data.message);
      }
    } catch {
      setError("Network error — please retry.");
    } finally {
      setPlacing(false);
    }
  }

  // ── Phase rendering ───────────────────────────────────────────────────────
  if (orderId && orderStatus === "SERVED") {
    return (
      <main className="min-h-screen bg-void text-cream flex items-center justify-center px-4 py-12">
        <ServedPhase orderId={orderId} tableNum={tableNum} />
      </main>
    );
  }

  if (orderId && orderStatus && orderStatus !== "SERVED") {
    return (
      <main className="min-h-screen bg-void text-cream flex items-center justify-center px-4 py-12">
        <WaitingPhase
          orderId={orderId}
          tableNum={tableNum}
          status={orderStatus}
        />
      </main>
    );
  }

  // ── BUILD render helpers ──────────────────────────────────────────────────
  const isReview = buildStep === "REVIEW";
  const stepIdx = BUILD_STEPS.indexOf(buildStep);

  // Decide what occupies the canvas area for the current step
  function renderCanvasArea() {
    const orbitItems =
      buildStep === "SAUCE"
        ? grouped.SAUCE
        : buildStep === "CHEESE"
          ? grouped.CHEESE
          : buildStep === "TOPPINGS"
            ? grouped.TOPPING
            : null;

    const orbitSelectedIds =
      buildStep === "SAUCE"
        ? selectedIdsByLayer.SAUCE
        : buildStep === "CHEESE"
          ? selectedIdsByLayer.CHEESE
          : buildStep === "TOPPINGS"
            ? selectedIdsByLayer.TOPPING
            : new Set<number>();

    const swipeProps =
      buildStep === "DOUGH"
        ? {
            onSwipe: cycleDough,
            swipeHint: { left: "Previous dough", right: "Next dough" },
          }
        : {};

    const pinchProps = buildStep === "SIZE" ? { onPinch: bumpSize } : {};

    const canvas = (
      <PizzaCanvas
        ref={canvasRef}
        layers={selected}
        size={pizzaSize}
        glow={isReview}
        diameter={canvasDiameter}
        sliceGuides={buildStep === "SIZE"}
        {...swipeProps}
        {...pinchProps}
      />
    );

    if (orbitItems && orbitItems.length > 0) {
      return (
        <RotatingOrbit
          items={orbitItems}
          selectedIds={orbitSelectedIds}
          onApply={applyIngredient}
          onFocus={setFocusedItem}
          dropTargetRef={canvasRef}
          ringSize={ringSize}
          tileSize={orbitTile}
        >
          {canvas}
        </RotatingOrbit>
      );
    }

    return canvas;
  }

  function renderStepBlurb() {
    switch (buildStep) {
      case "DOUGH":
        return (
          <DoughStep
            bases={grouped.BASE}
            selectedId={selectedBase?.id ?? null}
          />
        );
      case "SIZE":
        return <SizeStep size={pizzaSize} onChange={setPizzaSize} />;
      case "SAUCE":
        return (
          <OrbitStep
            stepLabel="Step 3 — Pour the sauce"
            helper="Drag a sauce from the orbit onto the pizza, or tap it to add."
          />
        );
      case "CHEESE":
        return (
          <OrbitStep
            stepLabel="Step 4 — Top with cheese"
            helper="Grab a cheese and slide it onto your pizza, or tap to add."
          />
        );
      case "TOPPINGS":
        return (
          <OrbitStep
            stepLabel="Step 5 — Stack the toppings"
            helper="Drag as many toppings as you like onto the pizza. Tap an existing topping to remove it."
            selectedCount={selectedToppings.length}
            selectedNoun="topping"
          />
        );
      case "REVIEW":
        return null;
    }
  }

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <main className="forno-room font-ui relative min-h-screen lg:h-[100dvh] lg:overflow-hidden text-cream px-4 sm:px-6 py-4 flex flex-col">
      <IntroOverlay />

      {/* Grain texture over the whole room */}
      <div className="forno-grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay z-0" />

      <div className="relative z-10 max-w-[1200px] w-full mx-auto flex flex-col gap-3.5 flex-1 min-h-0">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-baseline gap-3 min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-ember/90 shrink-0">
              Pizza<span className="text-cheese">3.14</span>
            </span>
            <span className="hidden sm:block h-4 w-px bg-cream/15 shrink-0" />
            <h1 className="font-display text-2xl md:text-[28px] leading-none tracking-tight text-cream truncate">
              Build your{" "}
              <span className="italic text-gradient-forno">pizza</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Compact combo chip */}
            {combo && !comboDismissed && !isReview && (
              <div className="hidden sm:flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full forno-panel">
                <span className="text-sm">🔥</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cheese/90 whitespace-nowrap">
                  Famous&nbsp;combo
                </span>
                <button
                  onClick={applyCombo}
                  className="px-3 py-1 rounded-full forno-cta text-void text-[11px] font-bold tracking-wide transition-all"
                >
                  Apply
                </button>
                <button
                  onClick={() => setComboDismissed(true)}
                  aria-label="Dismiss combo suggestion"
                  className="w-6 h-6 rounded-full text-cream/40 hover:text-cream hover:bg-cream/10 transition-colors text-sm leading-none"
                >
                  ×
                </button>
              </div>
            )}
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream/40 whitespace-nowrap">
              Table&nbsp;
              <span className="text-cream/80">
                {String(tableNum).padStart(2, "0")}
              </span>
            </span>
          </div>
        </header>

        {menuError && (
          <div className="px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-sm shrink-0">
            {menuError}
          </div>
        )}

        <div className="shrink-0">
          <BuildStepper
            current={buildStep}
            completed={completedSteps}
            onJump={jumpTo}
          />
        </div>

        {isReview ? (
          <div className="flex-1 min-h-0 lg:overflow-y-auto flex flex-col items-center gap-6 py-1">
            <div
              ref={canvasAreaRef}
              className="w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden"
            >
              {renderCanvasArea()}
            </div>
            <ReviewStep
              base={selectedBase}
              sauce={selectedSauce}
              cheese={selectedCheese}
              toppings={selectedToppings}
              size={pizzaSize}
              totals={totals}
              onEdit={(s) => setBuildStep(s)}
              onPlaceOrder={placeOrder}
              canPlace={canPlace}
              placing={placing}
              error={error}
            />
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[220px_1fr_232px] lg:[grid-template-rows:minmax(0,1fr)] gap-4 lg:gap-5 items-start lg:items-stretch">
              {/* Left: contextual ingredient / size detail */}
              <aside className="order-2 lg:order-1 lg:self-center">
                <IngredientDetail
                  item={detailItem}
                  sizeMode={buildStep === "SIZE"}
                  size={pizzaSize}
                />
              </aside>

              {/* Center: the hero pizza + floating step caption */}
              <section className="order-1 lg:order-2 relative flex flex-col items-center min-h-0">
                <div
                  ref={canvasAreaRef}
                  className="w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden"
                >
                  {renderCanvasArea()}
                </div>
                <div className="w-full max-w-lg shrink-0 pt-1">
                  {renderStepBlurb()}
                </div>
              </section>

              {/* Right: Bill */}
              <aside className="order-3 lg:self-center">
                <BillPanel
                  items={selected}
                  totals={totals}
                  onRemove={removeById}
                  locked={!!orderId}
                />
              </aside>
            </div>

            {/* ── Full-width action bar ─────────────────────────────── */}
            <div className="shrink-0 flex items-center justify-between gap-3 rounded-2xl forno-panel px-3 py-2.5">
              <button
                onClick={goBack}
                disabled={stepIdx <= 0}
                className="px-4 py-2.5 rounded-xl text-cream/70 text-sm font-medium hover:text-cream hover:bg-cream/5 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              >
                ← Back
              </button>

              <div className="flex items-center gap-1.5">
                {BUILD_STEPS.map((s, i) => (
                  <span
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === stepIdx
                        ? "w-6 bg-ember"
                        : i < stepIdx
                          ? "w-1.5 bg-ember/50"
                          : "w-1.5 bg-cream/15"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                disabled={!canAdvance(buildStep)}
                className="px-6 py-2.5 rounded-xl forno-cta text-void text-sm font-bold tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {stepIdx === BUILD_STEPS.length - 2
                  ? "Review Order →"
                  : "Next →"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
