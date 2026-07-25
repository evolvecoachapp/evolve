import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { RecommendationEngineInput } from "../../decision-engine/models/RecommendationEngineInput";
import type { RecommendationContext } from "../models/RecommendationContext";
import type { RecommendationCategory } from "../models/RecommendationCategory";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import {
  freezeContext,
  freezeReference,
} from "../utils/FreezeRecommendationState";

export function buildRecommendationContext(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly handoff: RecommendationEngineInput | null;
  readonly focusAreas: readonly string[];
  readonly athletePresent: boolean;
  readonly at: string;
}): RecommendationContext {
  const decisionIds = Object.freeze(
    input.handoff?.decisionIds ?? input.decisions.map((d) => d.id),
  );
  const references = Object.freeze(
    (input.handoff?.recommendations ??
      input.decisions.flatMap((d) => d.recommendationRefs)
    ).map((ref) =>
      freezeReference({
        id: ref.id,
        decisionId: ref.decisionId,
        category: ref.category as RecommendationCategory,
        priorityOrdinal: ref.priorityOrdinal,
        intent: ref.intent,
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    ),
  );

  return freezeContext({
    id: input.id,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    decisionIds,
    references,
    focusAreas: Object.freeze([...input.focusAreas]),
    athletePresent: input.athletePresent,
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
