import type { NutritionAgentMetadata } from "./NutritionMetadata";
import type { NutritionGoal } from "./NutritionGoal";
import type { NutritionReasoning } from "./NutritionReasoning";

/**
 * Immutable planning context.
 */
export interface NutritionPlanningContext {
  readonly id: string;
  readonly contextId: string;
  readonly goal: NutritionGoal;
  readonly strategyId: string | null;
  readonly reasoning: readonly NutritionReasoning[];
  readonly calorieTarget: number | null;
  readonly proteinTargetG: number | null;
  readonly mealsPerDay: number | null;
  readonly hydrationLiters: number | null;
  readonly phaseHint: string | null;
  readonly metadata: NutritionAgentMetadata;
  readonly frozenAt: string;
}
