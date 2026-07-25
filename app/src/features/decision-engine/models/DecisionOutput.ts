import type { CoachingDecision } from "./CoachingDecision";
  import type { DecisionPackage } from "./DecisionPackage";
  import type { DecisionSummary } from "./DecisionSummary";
  import type { RecommendationEngineInput } from "./RecommendationEngineInput";

/**
 * Immutable output envelope for a Decision Engine operation.
 */
export interface DecisionOutput {
  readonly decisions: readonly CoachingDecision[];
  readonly package: DecisionPackage | null;
  readonly summary: DecisionSummary | null;
  readonly recommendationInput: RecommendationEngineInput | null;
}
