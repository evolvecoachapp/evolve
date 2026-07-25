import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function buildRecommendationEvidence(input: {
  readonly recommendation: CoachingRecommendation;
}): readonly ExplanationEvidence[] {
  const r = input.recommendation;
  return Object.freeze([
    freezeEvidence({
      id: `evidence:rec:${r.id}`,
      kind: ExplanationEvidenceKinds.RECOMMENDATION,
      key: `recommendation:${r.id}`,
      subjectId: r.id,
      sourceKey: r.sourceKeys[0] ?? r.id,
      valueKeys: Object.freeze([`intent:${r.intent}`, `type:${r.type}`, `category:${r.category}`]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
