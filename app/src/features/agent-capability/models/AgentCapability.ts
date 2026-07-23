import type { CapabilityDescriptor } from "./CapabilityDescriptor";
import type { CapabilityId } from "./CapabilityId";
import type { CapabilityMetadata } from "./CapabilityMetadata";

/**
 * Immutable capability bound to an owning agent.
 */
export interface AgentCapability {
  readonly capabilityId: CapabilityId;
  readonly agentId: string;
  readonly descriptor: CapabilityDescriptor;
  readonly enabled: boolean;
  readonly metadata: CapabilityMetadata;
}
