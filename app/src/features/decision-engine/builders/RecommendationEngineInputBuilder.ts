import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionSummary } from "../models/DecisionSummary";
import type { RecommendationEngineInput } from "../models/RecommendationEngineInput";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezeRecommendationInput } from "../utils/FreezeDecisionState";

export function buildRecommendationEngineInput(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly summary: DecisionSummary | null;
  readonly at: string;
}): RecommendationEngineInput {
  return freezeRecommendationInput({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisionIds: Object.freeze(input.decisions.map((d) => d.id)),
    recommendations: Object.freeze(
      input.decisions.flatMap((d) => d.recommendationRefs),
    ),
    summary: input.summary,
    metadata: EMPTY_DECISION_METADATA,
    createdAt: input.at,
  });
}
