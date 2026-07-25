import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

export function deriveConfidenceReasons(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationReason[] {
  const r = input.recommendation;
  return Object.freeze([
    freezeReason({
      id: `reason:confidence:${r.id}`,
      code: ExplanationReasonCodes.CONFIDENCE_LEVEL,
      subjectId: r.id,
      category: r.category,
      statementKey: `confidence.level.${r.confidence.level}`,
      evidenceKeys: Object.freeze([`recommendation:${r.id}`]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
