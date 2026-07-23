import type { CoachDecision } from "../models/CoachDecision";
import type { CoachEvaluation } from "../models/CoachValidation";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import type { SpecialistAgentKind } from "../models/SpecialistAgentKind";
import { validateMergedResult } from "../validators/validateMergedResult";
import { freezeEvaluation } from "../utils/FreezeCoachState";

/**
 * Deterministic evaluator for coaching decisions.
 * Orchestration integrity only — no domain reasoning.
 */
export class CoachDecisionEvaluator {
  evaluate(input: {
    readonly id: string;
    readonly decision: CoachDecision;
    readonly requestId?: string | null;
    readonly planId?: string | null;
    readonly agentsEvaluated?: readonly SpecialistAgentKind[];
    readonly evaluatedAt: string;
  }): CoachEvaluation {
    const validation = validateMergedResult(input.decision);
    const findings: string[] = [
      `Accepted: ${input.decision.accepted}`,
      `Confidence: ${input.decision.confidenceScore.toFixed(2)}`,
      `Recommendations: ${input.decision.recommendations.length}`,
      `Conflicts: ${input.decision.conflicts.length}`,
    ];

    if (!validation.valid) {
      findings.push(...validation.issues.map((i) => i.message));
    }

    const score = input.decision.accepted
      ? Math.min(1, Math.max(0, input.decision.confidenceScore))
      : Math.min(0.5, input.decision.confidenceScore);

    return freezeEvaluation({
      id: input.id,
      requestId: input.requestId ?? null,
      planId: input.planId ?? null,
      decisionId: input.decision.id,
      validation,
      findings: Object.freeze(findings),
      score,
      agentsEvaluated: Object.freeze([...(input.agentsEvaluated ?? [])]),
      metadata: EMPTY_COACH_METADATA,
      evaluatedAt: input.evaluatedAt,
    });
  }
}

export function createCoachDecisionEvaluator(): CoachDecisionEvaluator {
  return new CoachDecisionEvaluator();
}
