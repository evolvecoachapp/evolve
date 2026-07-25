import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { ExplanationTrace } from "../models/ExplanationTrace";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { createTraceStep } from "../utils/TraceHelpers";
import { freezeTrace } from "../utils/FreezeExplanationState";

export function buildRecommendationTrace(input: {
  readonly recommendation: CoachingRecommendation;
  readonly at: string;
}): ExplanationTrace {
  return freezeTrace({
    id: `trace:rec:${input.recommendation.id}`,
    steps: Object.freeze([
      createTraceStep({ id: `step:rec:load:${input.recommendation.id}`, operation: "load_recommendation", subjectId: input.recommendation.id, outputKeys: Object.freeze([input.recommendation.id]) }),
      createTraceStep({ id: `step:rec:reason:${input.recommendation.id}`, operation: "derive_reasons", subjectId: input.recommendation.id, inputKeys: Object.freeze([input.recommendation.decisionId]) }),
    ]),
    subjectId: input.recommendation.id,
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
