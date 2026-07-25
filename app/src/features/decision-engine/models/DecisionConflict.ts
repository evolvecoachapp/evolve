import type { DecisionMetadata } from "./DecisionMetadata";

export const DecisionConflictKinds = {
  PRIORITY: "priority",
  MUTUAL_EXCLUSION: "mutual_exclusion",
  DEPENDENCY: "dependency",
  CONSTRAINT: "constraint",
  OUTCOME: "outcome",
} as const;

export type DecisionConflictKind =
  (typeof DecisionConflictKinds)[keyof typeof DecisionConflictKinds];

/**
 * Immutable conflict between decision candidates.
 */
export interface DecisionConflict {
  readonly id: string;
  readonly kind: DecisionConflictKind;
  readonly leftId: string;
  readonly rightId: string;
  readonly description: string;
  readonly resolved: boolean;
  readonly metadata: DecisionMetadata;
}
