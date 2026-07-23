/**
 * Agent session lifecycle status.
 */
export const WorkoutAgentStatuses = Object.freeze({
  IDLE: "idle" as const,
  PREPARING: "preparing" as const,
  REASONING: "reasoning" as const,
  PLANNING: "planning" as const,
  EVALUATING: "evaluating" as const,
  COMPLETED: "completed" as const,
  FAILED: "failed" as const,
});

export type WorkoutAgentStatus =
  (typeof WorkoutAgentStatuses)[keyof typeof WorkoutAgentStatuses];
