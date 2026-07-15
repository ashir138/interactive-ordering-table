"use client";

interface Props {
  stepLabel: string;
  helper: string;
  selectedCount?: number;
  selectedNoun?: string;
}

export default function OrbitStep({}: Props) {
  return <div className="hidden" aria-hidden="true" />;
}
