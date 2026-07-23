import {
  EMPTY_CAPABILITY_METADATA,
  type CapabilityMetadata,
} from "../models/CapabilityMetadata";
import type { CapabilityDescriptor } from "../models/CapabilityDescriptor";
import type { CapabilityId } from "../models/CapabilityId";
import { freezeDescriptor } from "../utils/FreezeCapabilityState";

export interface CapabilityDescriptorBuilderInput {
  readonly id: CapabilityId;
  readonly name: string;
  readonly description: string;
  readonly category?: string;
  readonly supportedOperations?: readonly string[];
  readonly metadata?: CapabilityMetadata;
}

/**
 * Builds an immutable CapabilityDescriptor.
 */
export class CapabilityDescriptorBuilder {
  build(input: CapabilityDescriptorBuilderInput): CapabilityDescriptor {
    return freezeDescriptor({
      id: input.id,
      name: input.name,
      description: input.description,
      category: input.category ?? "general",
      supportedOperations: Object.freeze([
        ...(input.supportedOperations ?? ["execute"]),
      ]),
      metadata: input.metadata ?? EMPTY_CAPABILITY_METADATA,
    });
  }
}

export function buildCapabilityDescriptor(
  input: CapabilityDescriptorBuilderInput,
): CapabilityDescriptor {
  return new CapabilityDescriptorBuilder().build(input);
}
