import type { DecisionMetadata } from "./DecisionMetadata";

export const DecisionConstraintKinds = {
  REQUIRED_SOURCE: "required_source",
  MUTUAL_EXCLUSION: "mutual_exclusion",
  SAFETY: "safety",
  DEPENDENCY: "dependency",
  PRIORITY_CEILING: "priority_ceiling",
} as const;

export type DecisionConstraintKind =
  (typeof DecisionConstraintKinds)[keyof typeof DecisionConstraintKinds];

/**
 * Immutable decision constraint — orchestration bounds only.
 */
export interface DecisionConstraint {
  readonly id: string;
  readonly kind: DecisionConstraintKind;
  readonly description: string;
  readonly subjectKeys: readonly string[];
  readonly blocking: boolean;
  readonly metadata: DecisionMetadata;
}
