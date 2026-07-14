"use client";

interface Props {
  stepLabel: string;
  helper: string;
  selectedCount?: number;
  selectedNoun?: string;
}

export default function OrbitStep({
  stepLabel,
  helper,
  selectedCount,
  selectedNoun,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center animate-rise">
      <p className="text-[9.5px] font-mono uppercase tracking-[0.3em] text-cheese/80">
        {stepLabel}
      </p>
      <p className="text-sm text-cream/70 max-w-md leading-snug font-ui">
        {helper}
      </p>
      {typeof selectedCount === "number" && (
        <span className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ember/12 border border-ember/30 text-[10px] font-mono uppercase tracking-widest text-ember">
          <span className="w-1 h-1 rounded-full bg-ember animate-pulse" />
          {selectedCount} {selectedNoun}
          {selectedCount === 1 ? "" : "s"} added
        </span>
      )}
    </div>
  );
}
