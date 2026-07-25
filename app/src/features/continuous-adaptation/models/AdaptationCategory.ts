export const AdaptationCategories = {
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  PERFORMANCE: "performance",
  ADHERENCE: "adherence",
  STATE: "state",
  GENERAL: "general",
} as const;

export type AdaptationCategory =
  (typeof AdaptationCategories)[keyof typeof AdaptationCategories];
