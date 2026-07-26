import type { DecisionRecommendation } from "../../../features/decisionEngine";
import type {
  RecommendationContext,
  RecommendationFeed,
  RecommendationService,
  RecommendationStore,
} from "../../../features/recommendations/types";
import { EMPTY_RECOMMENDATION_METADATA } from "../../../features/recommendation-engine/models/RecommendationMetadata";
import {
  RecommendationInputKinds,
} from "../../../features/recommendation-engine/models/RecommendationInput";
import type { RecommendationEngineService } from "../../../features/recommendation-engine/services/RecommendationEngineService";
import type { CoachingRecommendation } from "../../../features/recommendation-engine/models/CoachingRecommendation";

/**
 * Thin compatibility adapter: Recommendation Engine → legacy RecommendationService.
 * Keeps the Dashboard store/widget contract while executing the new pipeline.
 */
export class RecommendationEngineBridgeService implements RecommendationService {
  constructor(
    private readonly recommendationEngine: RecommendationEngineService,
    private readonly store: RecommendationStore,
  ) {}

  generateAndStoreRecommendations(
    context: RecommendationContext,
  ): RecommendationFeed {
    const athleteId = "athlete:default";
    const at = new Date().toISOString();
    const contextId = `context:${athleteId}:${context.contextVersion ?? at}`;

    const result = this.recommendationEngine.buildRecommendations({
      id: `request:recommendation:${contextId}`,
      kind: RecommendationInputKinds.BUILD,
      athleteId,
      sessionId: null,
      conversationId: null,
      contextId,
      recommendationContext: null,
      decisionHandoff: null,
      decisions: Object.freeze([]),
      recommendations: Object.freeze([]),
      reason: "dashboard recommendation bridge",
      metadata: EMPTY_RECOMMENDATION_METADATA,
      createdAt: at,
    });

    const recommendations = result.success
      ? result.recommendations.map(toLegacyRecommendation)
      : [];

    const feed: RecommendationFeed = {
      recommendations,
      generatedAt: new Date(at),
      contextVersion: context.contextVersion ?? contextId,
    };
    this.store.save(feed);
    return feed;
  }
}

export function createRecommendationEngineBridgeService(
  recommendationEngine: RecommendationEngineService,
  store: RecommendationStore,
): RecommendationService {
  return new RecommendationEngineBridgeService(recommendationEngine, store);
}

function toLegacyRecommendation(
  recommendation: CoachingRecommendation,
): DecisionRecommendation {
  const category = mapCategory(recommendation.category);
  return {
    id: recommendation.id,
    category,
    priority: recommendation.priority.ordinal,
    title: recommendation.title,
    description:
      recommendation.actions[0]?.key ?? recommendation.title,
    reason: recommendation.intent,
    confidence: recommendation.confidence.score / 100,
  };
}

function mapCategory(
  category: CoachingRecommendation["category"],
): DecisionRecommendation["category"] {
  switch (category) {
    case "training":
      return "workout";
    case "nutrition":
      return "nutrition";
    case "recovery":
    case "safety":
      return "recovery";
    case "lifestyle":
    case "goal":
    case "orchestration":
    default:
      return "lifestyle";
  }
}
