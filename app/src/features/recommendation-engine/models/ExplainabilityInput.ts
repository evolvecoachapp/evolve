import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationSummary } from "./RecommendationSummary";

/**
 * Immutable handoff for Explainability Engine — structure only.
 */
export interface ExplainabilityInput {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendationIds: readonly string[];
  readonly decisionIds: readonly string[];
  readonly summary: RecommendationSummary | null;
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
