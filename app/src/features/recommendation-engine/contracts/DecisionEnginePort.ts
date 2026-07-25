import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { DecisionIntent } from "../../decision-engine/models/DecisionIntent";
import { DecisionIntents } from "../../decision-engine/models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../../decision-engine/models/DecisionMetadata";
import { DecisionOutcomes } from "../../decision-engine/models/DecisionOutcome";
import type { RecommendationEngineInput } from "../../decision-engine/models/RecommendationEngineInput";

/**
 * Upstream Decision Engine contract — Recommendation Engine consumes decisions only.
 */
export interface DecisionEnginePort {
  loadDecisions(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): readonly CoachingDecision[];

  loadRecommendationHandoff(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): RecommendationEngineInput | null;
}

function createMockDecision(input: {
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly at: string;
  readonly category: "training" | "recovery" | "safety";
  readonly ordinal: number;
  readonly intent: DecisionIntent;
}): CoachingDecision {
  const id = `decision:${input.category}:mock`;
  return Object.freeze({
    id,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    category: input.category,
    intent: input.intent,
    outcome: DecisionOutcomes.ACCEPTED,
    title: `${input.category} decision`,
    priority: Object.freeze({
      category: input.category,
      ordinal: input.ordinal,
      label: input.category,
    }),
    confidence: Object.freeze({
      level: "high" as const,
      score: 90,
      evidenceCount: 1,
      notes: Object.freeze([] as string[]),
    }),
    score: Object.freeze({
      total: 90 - input.ordinal * 5,
      priorityComponent: 100 - input.ordinal * 10,
      confidenceComponent: 90,
      consistencyComponent: 90,
      riskComponent: input.category === "safety" ? 20 : 70,
      impactComponent: 80,
    }),
    reasons: Object.freeze([
      Object.freeze({
        code: "mock_reason",
        category: input.category,
        statement: "mock",
        evidenceKeys: Object.freeze([`source:${input.category}`]),
        metadata: EMPTY_DECISION_METADATA,
      }),
    ]),
    constraints: Object.freeze([]),
    dependencies: Object.freeze([]),
    recommendationRefs: Object.freeze([
      Object.freeze({
        id: `ref:${id}`,
        decisionId: id,
        category: input.category,
        priorityOrdinal: input.ordinal,
        intent: input.intent,
        metadata: EMPTY_DECISION_METADATA,
      }),
    ]),
    sourceKeys: Object.freeze([`source:${input.category}`]),
    metadata: EMPTY_DECISION_METADATA,
    createdAt: input.at,
  });
}

export function createMockDecisionEnginePort(): DecisionEnginePort {
  return {
    loadDecisions(input) {
      return Object.freeze([
        createMockDecision({
          ...input,
          category: "safety",
          ordinal: 0,
          intent: DecisionIntents.BLOCK,
        }),
        createMockDecision({
          ...input,
          category: "recovery",
          ordinal: 1,
          intent: DecisionIntents.RECOMMEND,
        }),
        createMockDecision({
          ...input,
          category: "training",
          ordinal: 2,
          intent: DecisionIntents.CONTINUE,
        }),
      ]);
    },
    loadRecommendationHandoff(input) {
      const decisions = this.loadDecisions(input);
      return Object.freeze({
        id: `rec-input:mock:${input.contextId}`,
        athleteId: input.athleteId,
        contextId: input.contextId,
        decisionIds: Object.freeze(decisions.map((d) => d.id)),
        recommendations: Object.freeze(
          decisions.flatMap((d) => d.recommendationRefs),
        ),
        summary: null,
        metadata: EMPTY_DECISION_METADATA,
        createdAt: input.at,
      });
    },
  };
}
