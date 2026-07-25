export const DecisionCategories = {
  TRAINING: "training",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  LIFESTYLE: "lifestyle",
  SAFETY: "safety",
  ORCHESTRATION: "orchestration",
} as const;

export type DecisionCategory =
  (typeof DecisionCategories)[keyof typeof DecisionCategories];
