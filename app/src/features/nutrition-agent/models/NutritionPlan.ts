import type { NutritionAgentMetadata } from "./NutritionMetadata";
import type { NutritionConfidence } from "./NutritionConfidence";
import type { NutritionGoal } from "./NutritionGoal";
import type { CalorieTargets } from "./CalorieTargets";
import type { MacroTargets } from "./MacroTargets";
import type { MealDistribution } from "./MealDistribution";
import type { HydrationPlan } from "./HydrationPlan";
import type { SupplementPlan } from "./SupplementPlan";

export type NutritionPhaseHint =
  | "cut"
  | "bulk"
  | "maintain"
  | "refeed"
  | "reverse"
  | "contest"
  | "unknown";

/**
 * Immutable nutrition plan proposal (planning only — no execution).
 */
export interface NutritionPlan {
  readonly id: string;
  readonly planningContextId: string;
  readonly goal: NutritionGoal;
  readonly strategyId: string | null;
  readonly calorieTargets: CalorieTargets;
  readonly macroTargets: MacroTargets;
  readonly mealDistribution: MealDistribution;
  readonly hydrationPlan: HydrationPlan;
  readonly supplementPlan: SupplementPlan;
  readonly phaseHint: NutritionPhaseHint;
  readonly confidence: NutritionConfidence;
  readonly rationale: readonly string[];
  readonly metadata: NutritionAgentMetadata;
  readonly createdAt: string;
}
