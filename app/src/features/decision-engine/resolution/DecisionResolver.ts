import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionResolution } from "../models/DecisionResolution";
import type { DecisionEvaluation } from "../models/DecisionEvaluation";
import type { CoachingDecision } from "../models/CoachingDecision";
import { DecisionOutcomes } from "../models/DecisionOutcome";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezeDecision } from "../utils/FreezeDecisionState";

/**
 * Decision resolver — candidates → immutable CoachingDecisions.
 */
export function resolveDecisions(input: {
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly candidates: readonly DecisionCandidate[];
  readonly evaluations: readonly DecisionEvaluation[];
  readonly resolutions: readonly DecisionResolution[];
  readonly at: string;
}): readonly CoachingDecision[] {
  const losers = new Set(
    input.resolutions.flatMap((r) => r.loserIds),
  );
  const evalBySubject = new Map(
    input.evaluations.map((e) => [e.subjectId, e]),
  );

  const decisions: CoachingDecision[] = [];
  for (const candidate of input.candidates) {
    if (losers.has(candidate.id)) continue;
    const evaluation = evalBySubject.get(candidate.id);
    const outcome =
      candidate.intent === "block"
        ? DecisionOutcomes.ACCEPTED
        : evaluation && !evaluation.passed
          ? DecisionOutcomes.REJECTED
          : DecisionOutcomes.ACCEPTED;

    if (outcome === DecisionOutcomes.REJECTED) continue;

    decisions.push(
      freezeDecision({
        id: `decision:${candidate.id}`,
        athleteId: input.athleteId,
        sessionId: input.sessionId,
        conversationId: input.conversationId,
        contextId: input.contextId,
        category: candidate.category,
        intent: candidate.intent,
        outcome,
        title: candidate.title,
        priority: candidate.priority,
        confidence: evaluation?.confidence ?? candidate.confidence,
        score:
          evaluation?.score ??
          Object.freeze({
            total: 50,
            priorityComponent: 50,
            confidenceComponent: 50,
            riskComponent: 50,
            impactComponent: 50,
            consistencyComponent: 50,
          }),
        reasons: candidate.reasons,
        constraints: Object.freeze([]),
        dependencies: Object.freeze([]),
        recommendationRefs: Object.freeze([
          Object.freeze({
            id: `rec-ref:${candidate.id}`,
            decisionId: `decision:${candidate.id}`,
            category: candidate.category,
            priorityOrdinal: candidate.priority.ordinal,
            intent: candidate.intent,
            metadata: EMPTY_DECISION_METADATA,
          }),
        ]),
        sourceKeys: candidate.sourceKeys,
        metadata: EMPTY_DECISION_METADATA,
        createdAt: input.at,
      }),
    );
  }
  return Object.freeze(decisions);
}
