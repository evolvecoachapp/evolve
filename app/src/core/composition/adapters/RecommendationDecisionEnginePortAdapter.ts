import type { DecisionEnginePort } from "../../../features/recommendation-engine/contracts/DecisionEnginePort";
import { EMPTY_DECISION_METADATA } from "../../../features/decision-engine/models/DecisionMetadata";
import {
  DecisionInputKinds,
  type DecisionInput,
} from "../../../features/decision-engine/models/DecisionInput";
import type { DecisionEngineService } from "../../../features/decision-engine/services/DecisionEngineService";

/**
 * Thin adapter: Decision Engine Service → Recommendation Engine DecisionEnginePort.
 */
export function createRecommendationDecisionEnginePortAdapter(
  decisionEngine: DecisionEngineService,
): DecisionEnginePort {
  const port: DecisionEnginePort = {
    loadDecisions(input) {
      const result = decisionEngine.buildDecision(toDecisionInput(input));
      return Object.freeze([...(result.decisions ?? [])]);
    },
    loadRecommendationHandoff(input) {
      const result = decisionEngine.buildDecision(toDecisionInput(input));
      return result.recommendationInput;
    },
  };
  return port;
}

function toDecisionInput(input: {
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly at: string;
}): DecisionInput {
  return Object.freeze({
    id: `request:decision:${input.contextId}`,
    kind: DecisionInputKinds.BUILD,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    decisionContext: null,
    decisions: Object.freeze([]),
    reason: "recommendation-engine handoff",
    metadata: EMPTY_DECISION_METADATA,
    createdAt: input.at,
  });
}
