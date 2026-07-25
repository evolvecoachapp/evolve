import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { ExplainabilityInput } from "../models/ExplainabilityInput";
import type { RecommendationSummary } from "../models/RecommendationSummary";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeExplainabilityInput } from "../utils/FreezeRecommendationState";

export function buildExplainabilityInput(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly decisionIds: readonly string[];
  readonly summary: RecommendationSummary | null;
  readonly at: string;
}): ExplainabilityInput {
  return freezeExplainabilityInput({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    recommendationIds: Object.freeze(input.recommendations.map((r) => r.id)),
    decisionIds: Object.freeze([...input.decisionIds]),
    summary: input.summary,
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
