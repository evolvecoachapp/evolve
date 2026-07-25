import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

export function deriveRecommendationReasons(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationReason[] {
  const r = input.recommendation;
  return Object.freeze([
    freezeReason({
      id: `reason:rec:${r.id}:intent`,
      code: ExplanationReasonCodes.RECOMMENDATION_INTENT,
      subjectId: r.id,
      category: r.category,
      statementKey: `recommendation.intent.${r.intent}`,
      evidenceKeys: Object.freeze([`recommendation:${r.id}`]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
    freezeReason({
      id: `reason:rec:${r.id}:category`,
      code: ExplanationReasonCodes.RECOMMENDATION_CATEGORY,
      subjectId: r.id,
      category: r.category,
      statementKey: `recommendation.category.${r.category}`,
      evidenceKeys: Object.freeze([`recommendation:${r.id}`]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
