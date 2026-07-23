import type { NutritionAgentMetadata } from "./NutritionMetadata";
import type { NutritionConfidence } from "./NutritionConfidence";
import type { NutritionIntent } from "./NutritionIntent";
import type { NutritionGoal } from "./NutritionGoal";
import type { NutritionPlan } from "./NutritionPlan";

/**
 * Agent decision after reasoning + planning + policy checks.
 */
export interface NutritionDecision {
  readonly id: string;
  readonly intent: NutritionIntent;
  readonly goal: NutritionGoal;
  readonly strategyId: string | null;
  readonly plan: NutritionPlan | null;
  readonly accepted: boolean;
  readonly confidence: NutritionConfidence;
  readonly reasons: readonly string[];
  readonly policyFlags: readonly string[];
  readonly metadata: NutritionAgentMetadata;
  readonly decidedAt: string;
}
