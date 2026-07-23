import type { CapabilityId } from "./CapabilityId";
import type { CapabilityRegistration } from "./CapabilityRegistration";

/**
 * Immutable deterministic capability match (no scoring / ranking).
 */
export interface CapabilityMatch {
  readonly capabilityId: CapabilityId;
  readonly agentId: string;
  readonly registration: CapabilityRegistration;
  readonly exact: boolean;
}
