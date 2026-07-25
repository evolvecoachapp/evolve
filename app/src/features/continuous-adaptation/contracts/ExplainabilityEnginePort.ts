import type { CoachingExplanation } from "../../explainability-engine/models/CoachingExplanation";
import { EMPTY_EXPLANATION_METADATA } from "../../explainability-engine/models/ExplanationMetadata";
import { priorityForOrdinal } from "../../explainability-engine/models/ExplanationPriority";

export interface ExplainabilityEnginePort {
  loadExplanations(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): readonly CoachingExplanation[];
}

function createMockExplanation(input: {
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly at: string;
  readonly decisionId: string;
  readonly recommendationId: string;
}): CoachingExplanation {
  const id = `explanation:${input.recommendationId}`;
  return Object.freeze({
    id,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    recommendationId: input.recommendationId,
    decisionId: input.decisionId,
    reasons: Object.freeze([]),
    evidence: Object.freeze([]),
    sections: Object.freeze([]),
    confidence: Object.freeze({
      level: "high" as const,
      score: 90,
      evidenceCount: 0,
      notes: Object.freeze([] as string[]),
    }),
    priority: priorityForOrdinal(1),
    decisionLink: Object.freeze({
      id: `dlink:${id}`,
      decisionId: input.decisionId,
      explanationId: id,
      category: "recovery",
      intent: "recommend",
      outcome: "accepted",
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
    recommendationLink: Object.freeze({
      id: `rlink:${id}`,
      recommendationId: input.recommendationId,
      explanationId: id,
      category: "recovery",
      intent: "act",
      type: "action",
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
    contextReference: Object.freeze({
      id: `cref:${id}`,
      contextId: input.contextId,
      athleteId: input.athleteId,
      focusAreaKeys: Object.freeze(["recovery"]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
    sourceKeys: Object.freeze(["source:recovery"]),
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}

export function createMockExplainabilityEnginePort(): ExplainabilityEnginePort {
  return {
    loadExplanations(input) {
      return Object.freeze([
        createMockExplanation({
          ...input,
          decisionId: "decision:recovery:mock",
          recommendationId: "rec:decision:recovery:mock",
        }),
      ]);
    },
  };
}
