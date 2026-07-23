/**
 * Pipeline execution status values.
 */
export const AIExecutionStatuses = {
  PENDING: "pending",
  VALIDATING: "validating",
  PREPARING: "preparing",
  RESOLVING_PROVIDER: "resolving_provider",
  EXECUTING: "executing",
  BUILDING_RESULT: "building_result",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  CANCELLED: "cancelled",
  TIMED_OUT: "timed_out",
} as const;

export type AIExecutionStatus =
  (typeof AIExecutionStatuses)[keyof typeof AIExecutionStatuses];
