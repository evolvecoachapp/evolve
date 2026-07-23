import type { RoutingMetadata } from "./RoutingMetadata";

export const RoutingEventTypes = {
  REQUEST_RECEIVED: "request_received",
  CONTEXT_BUILT: "context_built",
  CAPABILITIES_RESOLVED: "capabilities_resolved",
  PLAN_BUILT: "plan_built",
  PLAN_VALIDATED: "plan_validated",
  SNAPSHOT_BUILT: "snapshot_built",
  DESCRIBED: "described",
  FAILED: "failed",
} as const;

export type RoutingEventType =
  (typeof RoutingEventTypes)[keyof typeof RoutingEventTypes];

/**
 * Immutable routing lifecycle event.
 */
export interface RoutingEvent {
  readonly id: string;
  readonly type: RoutingEventType;
  readonly requestId: string | null;
  readonly planId: string | null;
  readonly message: string;
  readonly metadata: RoutingMetadata;
  readonly occurredAt: string;
}
