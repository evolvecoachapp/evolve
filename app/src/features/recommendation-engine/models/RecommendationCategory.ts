export const RecommendationCategories = {
  TRAINING: "training",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  LIFESTYLE: "lifestyle",
  SAFETY: "safety",
  ORCHESTRATION: "orchestration",
} as const;

export type RecommendationCategory =
  (typeof RecommendationCategories)[keyof typeof RecommendationCategories];
