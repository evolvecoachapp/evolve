/**
 * Agent session status for Nutrition Agent orchestration.
 */
export const NutritionAgentStatuses = Object.freeze({
  IDLE: "idle" as const,
  PREPARING: "preparing" as const,
  REASONING: "reasoning" as const,
  PLANNING: "planning" as const,
  EVALUATING: "evaluating" as const,
  COMPLETED: "completed" as const,
  FAILED: "failed" as const,
});

export type NutritionAgentStatus =
  (typeof NutritionAgentStatuses)[keyof typeof NutritionAgentStatuses];
