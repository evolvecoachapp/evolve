import type { DecisionRecommendationReference } from "./DecisionRecommendationReference";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionSummary } from "./DecisionSummary";

/**
 * Immutable handoff for Recommendation Engine — structure only.
 */
export interface RecommendationEngineInput {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionIds: readonly string[];
  readonly recommendations: readonly DecisionRecommendationReference[];
  readonly summary: DecisionSummary | null;
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}
