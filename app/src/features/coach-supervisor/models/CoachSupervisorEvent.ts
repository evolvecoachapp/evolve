import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";

export const CoachSupervisorEventTypes = {
  REQUEST_RECEIVED: "request_received",
  ROUTING_BUILT: "routing_built",
  PLAN_BUILT: "plan_built",
  EXECUTION_STARTED: "execution_started",
  AGENT_COMPLETED: "agent_completed",
  AGGREGATED: "aggregated",
  RESPONSE_BUILT: "response_built",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type CoachSupervisorEventType =
  (typeof CoachSupervisorEventTypes)[keyof typeof CoachSupervisorEventTypes];

export interface CoachSupervisorEvent {
  readonly id: string;
  readonly type: CoachSupervisorEventType;
  readonly requestId: string;
  readonly planId: string | null;
  readonly message: string | null;
  readonly metadata: CoachSupervisorMetadata;
  readonly occurredAt: string;
}
