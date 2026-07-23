import type { CapabilityMetadata } from "./CapabilityMetadata";
import type { CapabilityRegistration } from "./CapabilityRegistration";

/**
 * Immutable registry view — single source of truth snapshot of registrations.
 */
export interface CapabilityRegistry {
  readonly id: string;
  readonly registrations: readonly CapabilityRegistration[];
  readonly capabilityCount: number;
  readonly agentCount: number;
  readonly metadata: CapabilityMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
