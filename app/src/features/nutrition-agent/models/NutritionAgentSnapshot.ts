import type { NutritionDecision } from "./NutritionDecision";
import type { NutritionPlan } from "./NutritionPlan";
import type { NutritionExplanation } from "./NutritionExplanation";
import type { NutritionAgentStatistics } from "./NutritionStatistics";

/**
 * Immutable snapshot of a Nutrition Agent decision cycle.
 */
export interface NutritionAgentSnapshot {
  readonly id: string;
  readonly decision: NutritionDecision | null;
  readonly plan: NutritionPlan | null;
  readonly explanation: NutritionExplanation | null;
  readonly statistics: NutritionAgentStatistics;
  readonly frozenAt: string;
}
