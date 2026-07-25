import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function buildDependencyEvidence(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationEvidence[] {
  return Object.freeze(
    input.recommendation.dependencies.map((d) =>
      freezeEvidence({
        id: `evidence:dependency:${d.id}`,
        kind: ExplanationEvidenceKinds.DEPENDENCY,
        key: `dependency:${d.id}`,
        subjectId: input.recommendation.id,
        sourceKey: d.id,
        valueKeys: Object.freeze([d.fromId, d.toId]),
        metadata: EMPTY_EXPLANATION_METADATA,
      }),
    ),
  );
}
