import type { CapabilityDescriptor } from "./CapabilityDescriptor";
import type { CapabilityId } from "./CapabilityId";
import type { CapabilityMetadata } from "./CapabilityMetadata";

/**
 * Immutable registration record — immutable after creation.
 */
export interface CapabilityRegistration {
  readonly id: string;
  readonly capabilityId: CapabilityId;
  readonly agentId: string;
  readonly descriptor: CapabilityDescriptor;
  readonly supportedOperations: readonly string[];
  readonly enabled: boolean;
  readonly metadata: CapabilityMetadata;
  readonly registeredAt: string;
}
