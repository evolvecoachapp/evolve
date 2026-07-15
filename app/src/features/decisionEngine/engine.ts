import { DecisionContext, DecisionRecommendation } from "./types"
import { applyDecisionRules } from "./rules"

export function generateRecommendations(context: DecisionContext): DecisionRecommendation[] {
  return applyDecisionRules(context).sort((left, right) => right.priority - left.priority)
}
