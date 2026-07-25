export * from "./AdherenceEvaluator";
export * from "./CalorieEvaluator";
export * from "./ConsistencyEvaluator";
export * from "./HydrationEvaluator";
export * from "./MacroEvaluator";
export * from "./MealTimingEvaluator";
export * from "./RecoveryNutritionEvaluator";

import { evaluateAdherence } from "./AdherenceEvaluator";
import { evaluateCalorie } from "./CalorieEvaluator";
import { evaluateConsistency } from "./ConsistencyEvaluator";
import { evaluateHydration } from "./HydrationEvaluator";
import { evaluateMacro } from "./MacroEvaluator";
import { evaluateMealTiming } from "./MealTimingEvaluator";
import { evaluateRecoveryNutrition } from "./RecoveryNutritionEvaluator";

export interface NutritionEvaluationBundle {
  readonly calorie: ReturnType<typeof evaluateCalorie>;
  readonly macro: ReturnType<typeof evaluateMacro>;
  readonly hydration: ReturnType<typeof evaluateHydration>;
  readonly mealTiming: ReturnType<typeof evaluateMealTiming>;
  readonly recoveryNutrition: ReturnType<typeof evaluateRecoveryNutrition>;
  readonly adherence: ReturnType<typeof evaluateAdherence>;
  readonly consistency: ReturnType<typeof evaluateConsistency>;
}

export function evaluateNutritionSignals(signalKeys: readonly string[]): NutritionEvaluationBundle {
  return Object.freeze({
    calorie: evaluateCalorie(signalKeys),
    macro: evaluateMacro(signalKeys),
    hydration: evaluateHydration(signalKeys),
    mealTiming: evaluateMealTiming(signalKeys),
    recoveryNutrition: evaluateRecoveryNutrition(signalKeys),
    adherence: evaluateAdherence(signalKeys),
    consistency: evaluateConsistency(signalKeys),
  });
}
