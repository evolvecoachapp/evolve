import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

export function deriveDependencyReasons(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationReason[] {
  const r = input.recommendation;
  if (r.dependencies.length === 0) return Object.freeze([]);
  return Object.freeze(
    r.dependencies.map((dep) =>
      freezeReason({
        id: `reason:dep:${r.id}:${dep.id}`,
        code: ExplanationReasonCodes.DEPENDENCY_REQUIRED,
        subjectId: r.id,
        category: r.category,
        statementKey: `dependency.${dep.kind}`,
        evidenceKeys: Object.freeze([`dependency:${dep.id}`]),
        metadata: EMPTY_EXPLANATION_METADATA,
      }),
    ),
  );
}
