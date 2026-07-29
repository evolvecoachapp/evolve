export const AnalyticsCategories = {
  WORKOUT: "workout",
  STRENGTH: "strength",
  HYPERTROPHY: "hypertrophy",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  SLEEP: "sleep",
  BODY_WEIGHT: "body_weight",
  MEASUREMENTS: "measurements",
  CONSISTENCY: "consistency",
  GOALS: "goals",
} as const;

export type AnalyticsCategory = (typeof AnalyticsCategories)[keyof typeof AnalyticsCategories];
