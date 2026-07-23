import {
  EMPTY_CAPABILITY_METADATA,
  type CapabilityMetadata,
} from "../models/CapabilityMetadata";
import type { CapabilityRegistry } from "../models/CapabilityRegistry";
import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import { freezeRegistry } from "../utils/FreezeCapabilityState";
import {
  sortIdsDeterministic,
  sortRegistrationsDeterministic,
} from "../utils/sortHelpers";

export interface CapabilityRegistryBuilderInput {
  readonly id: string;
  readonly registrations: readonly CapabilityRegistration[];
  readonly metadata?: CapabilityMetadata;
  readonly createdAt: string;
  readonly frozenAt?: string;
}

/**
 * Builds an immutable CapabilityRegistry view.
 */
export class CapabilityRegistryBuilder {
  build(input: CapabilityRegistryBuilderInput): CapabilityRegistry {
    const registrations = sortRegistrationsDeterministic(input.registrations);
    const agentIds = sortIdsDeterministic([
      ...new Set(registrations.map((item) => item.agentId)),
    ]);

    return freezeRegistry({
      id: input.id,
      registrations,
      capabilityCount: registrations.length,
      agentCount: agentIds.length,
      metadata: input.metadata ?? EMPTY_CAPABILITY_METADATA,
      createdAt: input.createdAt,
      frozenAt: input.frozenAt ?? input.createdAt,
    });
  }
}

export function buildCapabilityRegistry(
  input: CapabilityRegistryBuilderInput,
): CapabilityRegistry {
  return new CapabilityRegistryBuilder().build(input);
}
