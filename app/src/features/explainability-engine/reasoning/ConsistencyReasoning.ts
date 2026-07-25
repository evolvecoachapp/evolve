import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

export function deriveConsistencyReasons(input: {
  readonly decision: CoachingDecision;
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationReason[] {
  const { decision, recommendation } = input;
  return Object.freeze([
    freezeReason({
      id: `reason:consistency:${recommendation.id}`,
      code: ExplanationReasonCodes.CONSISTENCY_CHECK,
      subjectId: recommendation.id,
      category: recommendation.category,
      statementKey: `consistency.decision.${decision.id}.recommendation.${recommendation.id}`,
      evidenceKeys: Object.freeze([`decision:${decision.id}`, `recommendation:${recommendation.id}`]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
