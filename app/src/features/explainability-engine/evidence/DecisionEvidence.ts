import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function buildDecisionEvidence(input: {
  readonly decision: CoachingDecision;
}): readonly ExplanationEvidence[] {
  const d = input.decision;
  return Object.freeze([
    freezeEvidence({
      id: `evidence:decision:${d.id}`,
      kind: ExplanationEvidenceKinds.DECISION,
      key: `decision:${d.id}`,
      subjectId: d.id,
      sourceKey: d.sourceKeys[0] ?? d.id,
      valueKeys: Object.freeze([`outcome:${d.outcome}`, `intent:${d.intent}`, `category:${d.category}`]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
