import {
  EMPTY_CAPABILITY_METADATA,
  type CapabilityMetadata,
} from "../models/CapabilityMetadata";
import type { CapabilityCollection } from "../models/CapabilityCollection";
import type { CapabilityError } from "../models/CapabilityError";
import type { CapabilityEvent } from "../models/CapabilityEvent";
import type { CapabilityOperationKind } from "../models/CapabilityResult";
import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import type { CapabilityResolution } from "../models/CapabilityResolution";
import type { CapabilityResult } from "../models/CapabilityResult";
import type { CapabilitySnapshot } from "../models/CapabilitySnapshot";
import type { CapabilityValidation } from "../models/CapabilityValidation";
import { freezeResult } from "../utils/FreezeCapabilityState";

export interface CapabilityResultBuilderInput {
  readonly id: string;
  readonly operation: CapabilityOperationKind;
  readonly success: boolean;
  readonly message?: string | null;
  readonly registration?: CapabilityRegistration | null;
  readonly resolution?: CapabilityResolution | null;
  readonly collection?: CapabilityCollection | null;
  readonly snapshot?: CapabilitySnapshot | null;
  readonly exists?: boolean | null;
  readonly ownerAgentId?: string | null;
  readonly validation?: CapabilityValidation;
  readonly error?: CapabilityError | null;
  readonly events?: readonly CapabilityEvent[];
  readonly metadata?: CapabilityMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt?: string;
}

/**
 * Builds an immutable CapabilityResult.
 */
export class CapabilityResultBuilder {
  build(input: CapabilityResultBuilderInput): CapabilityResult {
    return freezeResult({
      id: input.id,
      operation: input.operation,
      success: input.success,
      message: input.message ?? null,
      registration: input.registration ?? null,
      resolution: input.resolution ?? null,
      collection: input.collection ?? null,
      snapshot: input.snapshot ?? null,
      exists: input.exists ?? null,
      ownerAgentId: input.ownerAgentId ?? null,
      validation:
        input.validation ??
        Object.freeze({ valid: true, issues: Object.freeze([]) }),
      error: input.error ?? null,
      events: Object.freeze([...(input.events ?? [])]),
      metadata: input.metadata ?? EMPTY_CAPABILITY_METADATA,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
      frozenAt: input.frozenAt ?? input.completedAt,
    });
  }
}

export function buildCapabilityResult(
  input: CapabilityResultBuilderInput,
): CapabilityResult {
  return new CapabilityResultBuilder().build(input);
}
