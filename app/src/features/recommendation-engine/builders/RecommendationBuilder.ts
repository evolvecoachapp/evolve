import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationAction } from "../models/RecommendationAction";
import { RecommendationIntents } from "../models/RecommendationIntent";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { priorityForCategory } from "../models/RecommendationPriority";
import { RecommendationTypes } from "../models/RecommendationType";
import { RecommendationTargetKinds } from "../models/RecommendationTarget";
import {
  freezeAction,
  freezeRecommendation,
} from "../utils/FreezeRecommendationState";

function mapIntent(
  decisionIntent: string,
): (typeof RecommendationIntents)[keyof typeof RecommendationIntents] {
  switch (decisionIntent) {
    case "block":
      return RecommendationIntents.ESCALATE;
    case "defer":
      return RecommendationIntents.DEFER;
    case "recommend":
    case "continue":
      return RecommendationIntents.ACT;
    case "escalate":
      return RecommendationIntents.ESCALATE;
    default:
      return RecommendationIntents.INFORM;
  }
}

function mapType(
  decisionIntent: string,
): (typeof RecommendationTypes)[keyof typeof RecommendationTypes] {
  if (decisionIntent === "block") return RecommendationTypes.CONSTRAINT;
  if (decisionIntent === "recommend") return RecommendationTypes.ACTION;
  return RecommendationTypes.GUIDANCE;
}

/**
 * Build immutable CoachingRecommendation from CoachingDecision.
 */
export function buildRecommendation(input: {
  readonly decision: CoachingDecision;
  readonly at: string;
}): CoachingRecommendation {
  const decision = input.decision;
  const category = decision.category as CoachingRecommendation["category"];
  const type = mapType(decision.intent);
  const intent = mapIntent(decision.intent);
  const action: RecommendationAction = freezeAction({
    id: `action:${decision.id}`,
    type,
    key: `${category}.${decision.intent}`,
    targetKey: decision.category,
    parameters: Object.freeze({
      decisionId: decision.id,
      outcome: decision.outcome,
    }),
    metadata: EMPTY_RECOMMENDATION_METADATA,
  });

  return freezeRecommendation({
    id: `rec:${decision.id}`,
    athleteId: decision.athleteId,
    sessionId: decision.sessionId,
    conversationId: decision.conversationId,
    contextId: decision.contextId,
    decisionId: decision.id,
    category,
    intent,
    type,
    title: decision.title,
    priority: priorityForCategory(category),
    confidence: Object.freeze({
      level:
        decision.confidence.level === "high" ||
        decision.confidence.level === "medium" ||
        decision.confidence.level === "low"
          ? decision.confidence.level
          : "unknown",
      score: decision.confidence.score,
      notes: Object.freeze([...decision.confidence.notes]),
    }),
    actions: Object.freeze([action]),
    sequence: null,
    constraints: Object.freeze([]),
    dependencies: Object.freeze([]),
    targets: Object.freeze([
      Object.freeze({
        id: `target:athlete:${decision.athleteId}`,
        kind: RecommendationTargetKinds.ATHLETE,
        referenceId: decision.athleteId,
        label: "athlete",
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
      Object.freeze({
        id: `target:explainability:${decision.id}`,
        kind: RecommendationTargetKinds.EXPLAINABILITY,
        referenceId: decision.id,
        label: "explainability",
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    ]),
    sourceKeys: Object.freeze([...decision.sourceKeys]),
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}

export function buildRecommendationsFromDecisions(input: {
  readonly decisions: readonly CoachingDecision[];
  readonly at: string;
}): readonly CoachingRecommendation[] {
  return Object.freeze(
    input.decisions.map((decision) =>
      buildRecommendation({ decision, at: input.at }),
    ),
  );
}
