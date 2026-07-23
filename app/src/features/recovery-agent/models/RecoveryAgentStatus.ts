export const RecoveryAgentStatuses = Object.freeze({
  IDLE: "idle" as const,
  PREPARING: "preparing" as const,
  REASONING: "reasoning" as const,
  PLANNING: "planning" as const,
  EVALUATING: "evaluating" as const,
  COMPLETED: "completed" as const,
  FAILED: "failed" as const,
});

export type RecoveryAgentStatus =
  (typeof RecoveryAgentStatuses)[keyof typeof RecoveryAgentStatuses];
