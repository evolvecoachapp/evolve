import type { NutritionPlanningContext } from "./NutritionPlanningContext";
import type { NutritionPlan } from "./NutritionPlan";

/**
 * Immutable planning result.
 */
export interface NutritionPlanningResult {
  readonly id: string;
  readonly planningContext: NutritionPlanningContext;
  readonly plan: NutritionPlan;
  readonly plannerIds: readonly string[];
  readonly success: boolean;
  readonly message: string | null;
  readonly frozenAt: string;
}
