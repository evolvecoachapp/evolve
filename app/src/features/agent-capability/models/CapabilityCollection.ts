import type { AgentCapability } from "./AgentCapability";
import type { CapabilityMetadata } from "./CapabilityMetadata";
import type { CapabilityRegistration } from "./CapabilityRegistration";

/**
 * Immutable ordered collection of capabilities / registrations.
 */
export interface CapabilityCollection {
  readonly id: string;
  readonly capabilities: readonly AgentCapability[];
  readonly registrations: readonly CapabilityRegistration[];
  readonly count: number;
  readonly metadata: CapabilityMetadata;
  readonly createdAt: string;
}
