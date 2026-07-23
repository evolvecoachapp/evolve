import {
  EMPTY_CAPABILITY_METADATA,
  type CapabilityMetadata,
} from "../models/CapabilityMetadata";
import type { CapabilityId } from "../models/CapabilityId";
import type { CapabilityMatch } from "../models/CapabilityMatch";
import type { CapabilityResolution } from "../models/CapabilityResolution";
import type { CapabilityValidation } from "../models/CapabilityValidation";
import { freezeResolution } from "../utils/FreezeCapabilityState";
import { sortMatchesDeterministic } from "../utils/sortHelpers";

export interface CapabilityResolutionBuilderInput {
  readonly id: string;
  readonly requestedCapabilityId: CapabilityId;
  readonly matches?: readonly CapabilityMatch[];
  readonly validation?: CapabilityValidation;
  readonly metadata?: CapabilityMetadata;
  readonly resolvedAt: string;
}

/**
 * Builds an immutable CapabilityResolution (deterministic; no scoring).
 */
export class CapabilityResolutionBuilder {
  build(input: CapabilityResolutionBuilderInput): CapabilityResolution {
    const matches = sortMatchesDeterministic(input.matches ?? []);
    const ownerAgentId = matches.length > 0 ? matches[0].agentId : null;

    return freezeResolution({
      id: input.id,
      requestedCapabilityId: input.requestedCapabilityId,
      found: matches.length > 0,
      matches,
      ownerAgentId,
      validation: input.validation ?? Object.freeze({ valid: true, issues: Object.freeze([]) }),
      metadata: input.metadata ?? EMPTY_CAPABILITY_METADATA,
      resolvedAt: input.resolvedAt,
    });
  }
}

export function buildCapabilityResolution(
  input: CapabilityResolutionBuilderInput,
): CapabilityResolution {
  return new CapabilityResolutionBuilder().build(input);
}
