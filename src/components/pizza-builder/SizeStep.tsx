"use client";

import type { PizzaSize } from "./PizzaCanvas";

interface Props {
  size: PizzaSize;
  onChange: (size: PizzaSize) => void;
}

export default function SizeStep({}: Props) {
  return (
    <div className="flex flex-col items-center gap-4 text-center animate-rise">
      <div className="hidden" aria-hidden="true" />
    </div>
  );
}
