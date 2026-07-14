export type PizzaSize = "SMALL" | "MEDIUM" | "LARGE";

export const SIZE_MULTIPLIERS: Record<PizzaSize, number> = {
  SMALL: 0.85,
  MEDIUM: 1,
  LARGE: 1.25,
};

export const SIZE_LABELS: Record<PizzaSize, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
};

export const SIZE_SHORT_LABELS: Record<PizzaSize, string> = {
  SMALL: "S",
  MEDIUM: "M",
  LARGE: "L",
};

// Display metadata for the size step (diameter + serving guidance).
export const SIZE_META: Record<
  PizzaSize,
  { diameter: string; feeds: string }
> = {
  SMALL: { diameter: '9"', feeds: "Feeds 1–2" },
  MEDIUM: { diameter: '12"', feeds: "Feeds 3–4" },
  LARGE: { diameter: '15"', feeds: "Feeds 5–6" },
};

// Tailwind size classes for the circular pizza canvas container.
// Desktop-first — canvas is the hero of the tabletop experience.
export const SIZE_CANVAS_CLASS: Record<PizzaSize, string> = {
  SMALL:  "w-[420px] h-[420px]",
  MEDIUM: "w-[560px] h-[560px]",
  LARGE:  "w-[680px] h-[680px]",
};
