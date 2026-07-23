import type { CapabilityId } from "./CapabilityId";
import type { CapabilityMetadata } from "./CapabilityMetadata";

/**
 * Immutable capability definition (what can be done — not who executes).
 */
export interface CapabilityDescriptor {
  readonly id: CapabilityId;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly supportedOperations: readonly string[];
  readonly metadata: CapabilityMetadata;
}
