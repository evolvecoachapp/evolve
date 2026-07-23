/**
 * Collaboration lifecycle statuses (orchestration only).
 */
export const CollaborationStatuses = {
  IDLE: "idle",
  VALIDATING: "validating",
  PLANNING: "planning",
  DISPATCHING: "dispatching",
  EXECUTING: "executing",
  AGGREGATING: "aggregating",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type CollaborationStatus =
  (typeof CollaborationStatuses)[keyof typeof CollaborationStatuses];

export const ALL_COLLABORATION_STATUSES: readonly CollaborationStatus[] =
  Object.freeze(Object.values(CollaborationStatuses));
