export const AdaptationPriorityLabels = {
  CRITICAL: "critical",
  HIGH: "high",
  NORMAL: "normal",
  LOW: "low",
} as const;

export type AdaptationPriorityLabel =
  (typeof AdaptationPriorityLabels)[keyof typeof AdaptationPriorityLabels];

export interface AdaptationPriority {
  readonly ordinal: number;
  readonly urgency: number;
  readonly label: AdaptationPriorityLabel;
}

/** Deterministic ordinal → priority table (no heuristics). */
export function priorityForOrdinal(ordinal: number): AdaptationPriority {
  const clamped = Math.max(0, Math.min(3, Math.floor(ordinal)));
  const labels: AdaptationPriorityLabel[] = ["critical", "high", "normal", "low"];
  return Object.freeze({
    ordinal: clamped,
    urgency: Math.max(0, 100 - clamped * 25),
    label: labels[clamped]!,
  });
}
