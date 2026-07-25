import type { DecisionCategory } from "./DecisionCategory";

/**
 * Immutable priority stamp — fixed ordinal tables only (no heuristics).
 */
export interface DecisionPriority {
  readonly category: DecisionCategory;
  readonly ordinal: number;
  readonly label: string;
}

/** Fixed category priority: lower ordinal = higher priority. */
export const DEFAULT_DECISION_PRIORITIES: readonly DecisionPriority[] =
  Object.freeze([
    Object.freeze({
      category: "safety" as const,
      ordinal: 0,
      label: "safety",
    }),
    Object.freeze({
      category: "recovery" as const,
      ordinal: 1,
      label: "recovery",
    }),
    Object.freeze({
      category: "training" as const,
      ordinal: 2,
      label: "training",
    }),
    Object.freeze({
      category: "nutrition" as const,
      ordinal: 3,
      label: "nutrition",
    }),
    Object.freeze({
      category: "goal" as const,
      ordinal: 4,
      label: "goal",
    }),
    Object.freeze({
      category: "lifestyle" as const,
      ordinal: 5,
      label: "lifestyle",
    }),
    Object.freeze({
      category: "orchestration" as const,
      ordinal: 6,
      label: "orchestration",
    }),
  ]);
