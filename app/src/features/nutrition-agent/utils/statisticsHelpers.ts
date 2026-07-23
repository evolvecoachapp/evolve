import type { NutritionReasoning } from "../models/NutritionReasoning";
import type { NutritionRecommendation } from "../models/NutritionRecommendation";
import type { NutritionValidation } from "../models/NutritionValidation";
import type { NutritionPlan } from "../models/NutritionPlan";
import type { NutritionAgentStatistics } from "../models/NutritionStatistics";
import { freezeStatistics } from "./FreezeNutritionState";

export function computeAgentStatistics(input: {
  readonly reasoning: readonly NutritionReasoning[];
  readonly plannerCount: number;
  readonly recommendations: readonly NutritionRecommendation[];
  readonly validation: NutritionValidation;
  readonly plan: NutritionPlan;
  readonly durationMs: number;
}): NutritionAgentStatistics {
  return freezeStatistics({
    reasonerCount: input.reasoning.length,
    plannerCount: input.plannerCount,
    recommendationCount: input.recommendations.length,
    issueCount: input.validation.issues.length,
    targetCalories: input.plan.calorieTargets.targetCalories,
    proteinG: input.plan.macroTargets.proteinG,
    durationMs: Math.max(0, input.durationMs),
  });
}
