import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { ExplainabilityInput } from "../../recommendation-engine/models/ExplainabilityInput";
import { RecommendationIntents } from "../../recommendation-engine/models/RecommendationIntent";
import { EMPTY_RECOMMENDATION_METADATA } from "../../recommendation-engine/models/RecommendationMetadata";
import { priorityForCategory } from "../../recommendation-engine/models/RecommendationPriority";
import { RecommendationTypes } from "../../recommendation-engine/models/RecommendationType";

export interface RecommendationEnginePort {
  loadRecommendations(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): readonly CoachingRecommendation[];

  loadExplainabilityHandoff(input: {
    readonly athleteId: string;
    readonly sessionId: string | null;
    readonly conversationId: string | null;
    readonly contextId: string;
    readonly at: string;
  }): ExplainabilityInput | null;
}

function createMockRecommendation(input: {
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly at: string;
  readonly category: "training" | "recovery" | "safety";
  readonly decisionId: string;
}): CoachingRecommendation {
  const id = `rec:${input.decisionId}`;
  const category = input.category;
  return Object.freeze({
    id,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    decisionId: input.decisionId,
    category,
    intent: category === "safety" ? RecommendationIntents.ESCALATE : RecommendationIntents.ACT,
    type: category === "safety" ? RecommendationTypes.CONSTRAINT : RecommendationTypes.ACTION,
    title: `${category} recommendation`,
    priority: priorityForCategory(category),
    confidence: Object.freeze({ level: "high" as const, score: 90, evidenceCount: 1, notes: Object.freeze([] as string[]) }),
    actions: Object.freeze([Object.freeze({ id: `action:${id}`, type: RecommendationTypes.ACTION, key: `${category}.act`, targetKey: category, parameters: Object.freeze({ decisionId: input.decisionId }), metadata: EMPTY_RECOMMENDATION_METADATA })]),
    sequence: null,
    constraints: Object.freeze([]),
    dependencies: Object.freeze([]),
    targets: Object.freeze([]),
    sourceKeys: Object.freeze([`source:${category}`]),
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}

export function createMockRecommendationEnginePort(): RecommendationEnginePort {
  return {
    loadRecommendations(input) {
      const decisions = ["decision:safety:mock", "decision:recovery:mock", "decision:training:mock"];
      const categories = ["safety", "recovery", "training"] as const;
      return Object.freeze(
        decisions.map((decisionId, i) =>
          createMockRecommendation({ ...input, category: categories[i]!, decisionId }),
        ),
      );
    },
    loadExplainabilityHandoff(input) {
      const recs = this.loadRecommendations(input);
      return Object.freeze({
        id: `explainability-handoff:mock:${input.contextId}`,
        athleteId: input.athleteId,
        contextId: input.contextId,
        recommendationIds: Object.freeze(recs.map((r) => r.id)),
        decisionIds: Object.freeze(recs.map((r) => r.decisionId)),
        summary: null,
        metadata: EMPTY_RECOMMENDATION_METADATA,
        createdAt: input.at,
      });
    },
  };
}
