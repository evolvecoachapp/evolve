import type { CapabilityMetadata } from "./CapabilityMetadata";

/**
 * Capability lifecycle / operation event types.
 */
export const CapabilityEventTypes = {
  REGISTERED: "registered",
  RESOLVED: "resolved",
  QUERIED: "queried",
  VALIDATED: "validated",
  SNAPSHOT_BUILT: "snapshot_built",
  REJECTED: "rejected",
} as const;

export type CapabilityEventType =
  (typeof CapabilityEventTypes)[keyof typeof CapabilityEventTypes];

/**
 * Immutable capability event (observability metadata only).
 */
export interface CapabilityEvent {
  readonly id: string;
  readonly type: CapabilityEventType;
  readonly capabilityId: string | null;
  readonly agentId: string | null;
  readonly message: string | null;
  readonly metadata: CapabilityMetadata;
  readonly occurredAt: string;
}
