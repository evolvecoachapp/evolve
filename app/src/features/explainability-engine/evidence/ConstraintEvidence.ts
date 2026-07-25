import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function buildConstraintEvidence(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationEvidence[] {
  return Object.freeze(
    input.recommendation.constraints.map((c) =>
      freezeEvidence({
        id: `evidence:constraint:${c.id}`,
        kind: ExplanationEvidenceKinds.CONSTRAINT,
        key: `constraint:${c.id}`,
        subjectId: input.recommendation.id,
        sourceKey: c.id,
        valueKeys: Object.freeze([...c.subjectKeys]),
        metadata: EMPTY_EXPLANATION_METADATA,
      }),
    ),
  );
}
