import type { RecommendationTimeline } from "../models/RecommendationTimeline";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeTimeline } from "../utils/FreezeRecommendationState";

export function buildRecommendationTimeline(input: {
  readonly id: string;
  readonly steps: readonly string[];
  readonly subjectId: string;
  readonly at: string;
}): RecommendationTimeline {
  return freezeTimeline({
    id: input.id,
    items: Object.freeze(
      input.steps.map((step, index) =>
        Object.freeze({
          id: `timeline:${input.id}:${index}`,
          at: input.at,
          kind: step,
          subjectId: input.subjectId,
          note: step,
          metadata: EMPTY_RECOMMENDATION_METADATA,
        }),
      ),
    ),
    createdAt: input.at,
  });
}
