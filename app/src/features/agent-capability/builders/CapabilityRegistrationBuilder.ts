import {
  EMPTY_CAPABILITY_METADATA,
  type CapabilityMetadata,
} from "../models/CapabilityMetadata";
import type { CapabilityDescriptor } from "../models/CapabilityDescriptor";
import type { CapabilityId } from "../models/CapabilityId";
import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import { freezeRegistration } from "../utils/FreezeCapabilityState";
import { buildCapabilityDescriptor } from "./CapabilityDescriptorBuilder";

export interface CapabilityRegistrationBuilderInput {
  readonly id: string;
  readonly capabilityId: CapabilityId;
  readonly agentId: string;
  readonly descriptor?: CapabilityDescriptor;
  readonly name?: string;
  readonly description?: string;
  readonly category?: string;
  readonly supportedOperations?: readonly string[];
  readonly enabled?: boolean;
  readonly metadata?: CapabilityMetadata;
  readonly registeredAt: string;
}

/**
 * Builds an immutable CapabilityRegistration.
 */
export class CapabilityRegistrationBuilder {
  build(input: CapabilityRegistrationBuilderInput): CapabilityRegistration {
    const descriptor =
      input.descriptor ??
      buildCapabilityDescriptor({
        id: input.capabilityId,
        name: input.name ?? input.capabilityId,
        description:
          input.description ?? `Capability ${input.capabilityId}`,
        category: input.category,
        supportedOperations: input.supportedOperations,
        metadata: input.metadata,
      });

    const supportedOperations =
      input.supportedOperations ?? descriptor.supportedOperations;

    return freezeRegistration({
      id: input.id,
      capabilityId: input.capabilityId,
      agentId: input.agentId,
      descriptor,
      supportedOperations: Object.freeze([...supportedOperations]),
      enabled: input.enabled ?? true,
      metadata: input.metadata ?? EMPTY_CAPABILITY_METADATA,
      registeredAt: input.registeredAt,
    });
  }
}

export function buildCapabilityRegistration(
  input: CapabilityRegistrationBuilderInput,
): CapabilityRegistration {
  return new CapabilityRegistrationBuilder().build(input);
}
