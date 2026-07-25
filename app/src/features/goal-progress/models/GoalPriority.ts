export const GoalPriorityLabels = {
  CRITICAL: "critical",
  HIGH: "high",
  NORMAL: "normal",
  LOW: "low",
} as const;

export type GoalPriorityLabel =
  (typeof GoalPriorityLabels)[keyof typeof GoalPriorityLabels];

export interface GoalPriority {
  readonly ordinal: number;
  readonly urgency: number;
  readonly label: GoalPriorityLabel;
}

/** Deterministic ordinal → priority table (no heuristics). */
export function priorityForOrdinal(ordinal: number): GoalPriority {
  const clamped = Math.max(0, Math.min(3, Math.floor(ordinal)));
  const labels: GoalPriorityLabel[] = ["critical", "high", "normal", "low"];
  return Object.freeze({
    ordinal: clamped,
    urgency: Math.max(0, 100 - clamped * 25),
    label: labels[clamped]!,
  });
}
