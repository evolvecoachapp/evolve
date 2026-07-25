import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

export function derivePriorityReasons(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationReason[] {
  const r = input.recommendation;
  return Object.freeze([
    freezeReason({
      id: `reason:priority:${r.id}`,
      code: ExplanationReasonCodes.PRIORITY_ORDERING,
      subjectId: r.id,
      category: r.category,
      statementKey: `priority.ordinal.${r.priority.ordinal}`,
      evidenceKeys: Object.freeze([`recommendation:${r.id}`]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
