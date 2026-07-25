import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

export function deriveConstraintReasons(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationReason[] {
  const r = input.recommendation;
  if (r.constraints.length === 0) return Object.freeze([]);
  return Object.freeze(
    r.constraints.map((c) =>
      freezeReason({
        id: `reason:constraint:${r.id}:${c.id}`,
        code: ExplanationReasonCodes.CONSTRAINT_APPLIED,
        subjectId: r.id,
        category: r.category,
        statementKey: `constraint.${c.kind}`,
        evidenceKeys: Object.freeze([`constraint:${c.id}`]),
        metadata: EMPTY_EXPLANATION_METADATA,
      }),
    ),
  );
}
