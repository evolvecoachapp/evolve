/**
 * Legacy recommendations presentation boundary (store / widget contract).
 *
 * Application generation defaults go through Composition Root via
 * `DefaultRecommendationService` → `RecommendationEngineBridgeService`.
 * Rule-based `LegacyRuleRecommendationService` is deprecated fallback only.
 */
export type {
  RecommendationFeed,
  RecommendationContext,
  RecommendationStore,
  RecommendationService,
} from "./types"
export { InMemoryRecommendationStore } from "./store"
export {
  createRecommendationService,
  createLegacyRecommendationService,
  DefaultRecommendationService,
  LegacyRuleRecommendationService,
  recommendationService,
  recommendationStore,
} from "./service"
