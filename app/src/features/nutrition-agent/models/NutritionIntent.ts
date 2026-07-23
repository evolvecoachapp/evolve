/**
 * High-level nutrition conversation / planning intent.
 */
export const NutritionIntents = Object.freeze({
  PLAN_NUTRITION: "plan_nutrition" as const,
  ADJUST_MACROS: "adjust_macros" as const,
  MEAL_TIMING: "meal_timing" as const,
  SUPPLEMENTATION: "supplementation" as const,
  HYDRATION: "hydration" as const,
  EDUCATION: "education" as const,
  EVALUATE_PLAN: "evaluate_plan" as const,
  BODY_COMPOSITION: "body_composition" as const,
  UNKNOWN: "unknown" as const,
});

export type NutritionIntent =
  (typeof NutritionIntents)[keyof typeof NutritionIntents];

export const ALL_NUTRITION_INTENTS: readonly NutritionIntent[] = Object.freeze(
  Object.values(NutritionIntents),
);
