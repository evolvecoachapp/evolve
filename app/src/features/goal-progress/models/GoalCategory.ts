export const GoalCategories = {
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  PERFORMANCE: "performance",
  ADHERENCE: "adherence",
  STATE: "state",
  GENERAL: "general",
} as const;

export type GoalCategory =
  (typeof GoalCategories)[keyof typeof GoalCategories];

/** Alias kept for generated evaluator references. */
export const AdaptationCategories = GoalCategories;
