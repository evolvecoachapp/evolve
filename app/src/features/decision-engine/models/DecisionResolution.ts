import type { DecisionMetadata } from "./DecisionMetadata";

export const DecisionResolutionStrategies = {
  HIGHER_PRIORITY: "higher_priority",
  SAFETY_FIRST: "safety_first",
  DEPENDENCY_ORDER: "dependency_order",
  KEEP_BOTH: "keep_both",
  DROP_LEFT: "drop_left",
  DROP_RIGHT: "drop_right",
} as const;

export type DecisionResolutionStrategy =
  (typeof DecisionResolutionStrategies)[keyof typeof DecisionResolutionStrategies];

/**
 * Immutable conflict resolution record — deterministic strategies only.
 */
export interface DecisionResolution {
  readonly id: string;
  readonly conflictId: string;
  readonly strategy: DecisionResolutionStrategy;
  readonly winnerId: string | null;
  readonly loserIds: readonly string[];
  readonly notes: readonly string[];
  readonly metadata: DecisionMetadata;
  readonly resolvedAt: string;
}
