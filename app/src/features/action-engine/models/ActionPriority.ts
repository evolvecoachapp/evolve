/**
 * Immutable priority levels for action planning.
 */
export type ActionPriority =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "deferred";

export const ActionPriorities = Object.freeze({
  CRITICAL: "critical" as const,
  HIGH: "high" as const,
  MEDIUM: "medium" as const,
  LOW: "low" as const,
  DEFERRED: "deferred" as const,
});

/** Numeric rank for deterministic ordering (higher = more urgent). */
export const ActionPriorityRanks = Object.freeze({
  critical: 100,
  high: 80,
  medium: 50,
  low: 20,
  deferred: 0,
} as const satisfies Record<ActionPriority, number>);
