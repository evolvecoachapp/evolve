import {
  EMPTY_COLLABORATION_METADATA,
  type CollaborationMetadata,
} from "../models/CollaborationMetadata";
import type { CollaborationEvent } from "../models/CollaborationEvent";
import type { CollaborationPlan } from "../models/CollaborationPlan";
import type { CollaborationResult } from "../models/CollaborationResult";
import {
  CollaborationOperationKinds,
  type CollaborationOperationKind,
} from "../models/CollaborationResult";
import type { CollaborationSnapshot } from "../models/CollaborationSnapshot";
import type { CollaborationStatus } from "../models/CollaborationStatus";
import { CollaborationStatuses } from "../models/CollaborationStatus";
import type { CollaborationValidation } from "../models/CollaborationValidation";
import type { AggregationResult } from "../models/AggregationResult";
import type { ExecutionResult } from "../models/ExecutionResult";
import { freezeResult } from "../utils/FreezeCollaborationState";

export interface CollaborationResultBuilderInput {
  readonly id: string;
  readonly collaborationId: string;
  readonly operation: CollaborationOperationKind;
  readonly success: boolean;
  readonly status?: CollaborationStatus;
  readonly message?: string | null;
  readonly plan?: CollaborationPlan | null;
  readonly results?: readonly ExecutionResult[];
  readonly aggregation?: AggregationResult | null;
  readonly snapshot?: CollaborationSnapshot | null;
  readonly validation: CollaborationValidation;
  readonly events?: readonly CollaborationEvent[];
  readonly metadata?: CollaborationMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
}

/**
 * Builds an immutable CollaborationResult.
 */
export class CollaborationResultBuilder {
  build(input: CollaborationResultBuilderInput): CollaborationResult {
    return freezeResult({
      id: input.id,
      collaborationId: input.collaborationId,
      operation: input.operation,
      success: input.success,
      status:
        input.status ??
        (input.success
          ? CollaborationStatuses.COMPLETED
          : CollaborationStatuses.FAILED),
      message: input.message ?? null,
      plan: input.plan ?? null,
      results: Object.freeze([...(input.results ?? [])]),
      aggregation: input.aggregation ?? null,
      snapshot: input.snapshot ?? null,
      validation: input.validation,
      events: Object.freeze([...(input.events ?? [])]),
      metadata: input.metadata ?? EMPTY_COLLABORATION_METADATA,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
      frozenAt: input.completedAt,
    });
  }
}

export function buildCollaborationResult(
  input: CollaborationResultBuilderInput,
): CollaborationResult {
  return new CollaborationResultBuilder().build(input);
}

export { CollaborationOperationKinds };
