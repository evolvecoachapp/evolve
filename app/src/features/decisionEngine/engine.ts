import { DecisionContext, DecisionRecommendation } from "./types"
import { applyDecisionRules } from "./rules"

/**
 * Legacy rule-based recommendation generator.
 *
 * @deprecated Prefer Composition Root Recommendation Engine via
 * `createRecommendationService` / `RecommendationEngineBridgeService`.
 */
export function generateRecommendations(context: DecisionContext): DecisionRecommendation[] {
  return applyDecisionRules(context).sort((left, right) => right.priority - left.priority)
}
