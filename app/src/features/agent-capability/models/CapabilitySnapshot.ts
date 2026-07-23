import type { CapabilityMetadata } from "./CapabilityMetadata";
import type { CapabilityRegistry } from "./CapabilityRegistry";
import type { CapabilityRegistration } from "./CapabilityRegistration";

/**
 * Immutable registry snapshot for Coach / Collaboration consumption.
 */
export interface CapabilitySnapshot {
  readonly id: string;
  readonly registry: CapabilityRegistry;
  readonly registrations: readonly CapabilityRegistration[];
  readonly capabilityIds: readonly string[];
  readonly agentIds: readonly string[];
  readonly capabilityCount: number;
  readonly agentCount: number;
  readonly metadata: CapabilityMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
