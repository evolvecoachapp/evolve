import type { CoachingDecision } from "./CoachingDecision";
  import type { DecisionDescriptor } from "./DecisionDescriptor";
  import type { DecisionError } from "./DecisionError";
  import type { DecisionPackage } from "./DecisionPackage";
  import type { DecisionSnapshot } from "./DecisionSnapshot";
  import type { DecisionSummary } from "./DecisionSummary";
  import type { DecisionValidation } from "./DecisionValidation";
  import type { RecommendationEngineInput } from "./RecommendationEngineInput";

export const DecisionOperationKinds = {
  BUILD: "build",
  EVALUATE: "evaluate",
  RESOLVE: "resolve",
  VALIDATE: "validate",
  DESCRIBE: "describe",
} as const;

export type DecisionOperationKind =
  (typeof DecisionOperationKinds)[keyof typeof DecisionOperationKinds];

/**
 * Immutable result of a Decision Engine operation.
 */
export interface DecisionResult {
  readonly id: string;
  readonly operation: DecisionOperationKind;
  readonly success: boolean;
  readonly decisions: readonly CoachingDecision[];
  readonly package: DecisionPackage | null;
  readonly summary: DecisionSummary | null;
  readonly snapshot: DecisionSnapshot | null;
  readonly recommendationInput: RecommendationEngineInput | null;
  readonly validation: DecisionValidation | null;
  readonly descriptor: DecisionDescriptor | null;
  readonly errors: readonly DecisionError[];
  readonly createdAt: string;
}
