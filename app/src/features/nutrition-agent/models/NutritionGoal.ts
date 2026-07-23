/**
 * Nutritional goal for Nutrition Agent planning.
 */
export const NutritionGoals = Object.freeze({
  FAT_LOSS: "fat_loss" as const,
  MUSCLE_GAIN: "muscle_gain" as const,
  MAINTENANCE: "maintenance" as const,
  RECOMPOSITION: "recomposition" as const,
  PERFORMANCE: "performance" as const,
  POWERLIFTING: "powerlifting" as const,
  HYPERTROPHY: "hypertrophy" as const,
  GENERAL_HEALTH: "general_health" as const,
  CONTEST_PREP: "contest_prep" as const,
  UNKNOWN: "unknown" as const,
});

export type NutritionGoal =
  (typeof NutritionGoals)[keyof typeof NutritionGoals];

export const ALL_NUTRITION_GOALS: readonly NutritionGoal[] = Object.freeze(
  Object.values(NutritionGoals),
);
