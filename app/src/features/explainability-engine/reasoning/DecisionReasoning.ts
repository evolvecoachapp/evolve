import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import { ExplanationReasonCodes } from "../models/ExplanationReason";
import type { ExplanationReason } from "../models/ExplanationReason";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeReason } from "../utils/FreezeExplanationState";

export function deriveDecisionReasons(input: {
  readonly decision: CoachingDecision;
}): readonly ExplanationReason[] {
  const d = input.decision;
  return Object.freeze([
    freezeReason({
      id: `reason:decision:${d.id}:outcome`,
      code: ExplanationReasonCodes.DECISION_OUTCOME,
      subjectId: d.id,
      category: d.category,
      statementKey: `decision.outcome.${d.outcome}`,
      evidenceKeys: Object.freeze([`decision:${d.id}`]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
    freezeReason({
      id: `reason:decision:${d.id}:intent`,
      code: ExplanationReasonCodes.DECISION_INTENT,
      subjectId: d.id,
      category: d.category,
      statementKey: `decision.intent.${d.intent}`,
      evidenceKeys: Object.freeze([`decision:${d.id}`]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}

