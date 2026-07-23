import {
  EMPTY_CAPABILITY_METADATA,
  type CapabilityMetadata,
} from "../models/CapabilityMetadata";
import type { CapabilityRegistry } from "../models/CapabilityRegistry";
import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import type { CapabilitySnapshot } from "../models/CapabilitySnapshot";
import { freezeSnapshot } from "../utils/FreezeCapabilityState";
import {
  sortIdsDeterministic,
  sortRegistrationsDeterministic,
} from "../utils/sortHelpers";
import { buildCapabilityRegistry } from "./CapabilityRegistryBuilder";

export interface CapabilitySnapshotBuilderInput {
  readonly id: string;
  readonly registry?: CapabilityRegistry;
  readonly registryId?: string;
  readonly registrations?: readonly CapabilityRegistration[];
  readonly metadata?: CapabilityMetadata;
  readonly createdAt: string;
  readonly frozenAt?: string;
}

/**
 * Builds an immutable CapabilitySnapshot.
 */
export class CapabilitySnapshotBuilder {
  build(input: CapabilitySnapshotBuilderInput): CapabilitySnapshot {
    const registry =
      input.registry ??
      buildCapabilityRegistry({
        id: input.registryId ?? `registry:${input.id}`,
        registrations: input.registrations ?? [],
        metadata: input.metadata,
        createdAt: input.createdAt,
        frozenAt: input.frozenAt ?? input.createdAt,
      });

    const registrations = sortRegistrationsDeterministic(
      registry.registrations,
    );
    const capabilityIds = sortIdsDeterministic(
      registrations.map((item) => item.capabilityId),
    );
    const agentIds = sortIdsDeterministic([
      ...new Set(registrations.map((item) => item.agentId)),
    ]);

    return freezeSnapshot({
      id: input.id,
      registry,
      registrations,
      capabilityIds,
      agentIds,
      capabilityCount: capabilityIds.length,
      agentCount: agentIds.length,
      metadata: input.metadata ?? EMPTY_CAPABILITY_METADATA,
      createdAt: input.createdAt,
      frozenAt: input.frozenAt ?? input.createdAt,
    });
  }
}

export function buildCapabilitySnapshotFromInput(
  input: CapabilitySnapshotBuilderInput,
): CapabilitySnapshot {
  return new CapabilitySnapshotBuilder().build(input);
}
