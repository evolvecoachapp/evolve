import type { CapabilityId } from "./CapabilityId";
import type { CapabilityMatch } from "./CapabilityMatch";
import type { CapabilityMetadata } from "./CapabilityMetadata";
import type { CapabilityValidation } from "./CapabilityValidation";

/**
 * Immutable result of deterministic capability resolution.
 */
export interface CapabilityResolution {
  readonly id: string;
  readonly requestedCapabilityId: CapabilityId;
  readonly found: boolean;
  readonly matches: readonly CapabilityMatch[];
  readonly ownerAgentId: string | null;
  readonly validation: CapabilityValidation;
  readonly metadata: CapabilityMetadata;
  readonly resolvedAt: string;
}
