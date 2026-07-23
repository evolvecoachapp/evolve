import type { CollaborationMetadata } from "./CollaborationMetadata";

/**
 * Collaboration lifecycle event types.
 */
export const CollaborationEventTypes = {
  REQUEST_RECEIVED: "request_received",
  VALIDATED: "validated",
  PLANNED: "planned",
  DISPATCHED: "dispatched",
  TASK_STARTED: "task_started",
  TASK_COMPLETED: "task_completed",
  TASK_FAILED: "task_failed",
  AGGREGATED: "aggregated",
  SNAPSHOT_BUILT: "snapshot_built",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type CollaborationEventType =
  (typeof CollaborationEventTypes)[keyof typeof CollaborationEventTypes];

/**
 * Immutable collaboration lifecycle event.
 */
export interface CollaborationEvent {
  readonly id: string;
  readonly type: CollaborationEventType;
  readonly collaborationId: string;
  readonly sequence: number;
  readonly message: string;
  readonly participantId: string | null;
  readonly taskId: string | null;
  readonly metadata: CollaborationMetadata;
  readonly occurredAt: string;
}
