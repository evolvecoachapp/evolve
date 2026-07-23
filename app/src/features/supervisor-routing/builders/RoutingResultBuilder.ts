import { EMPTY_ROUTING_METADATA } from "../models/RoutingMetadata";
import type { RoutingContext } from "../models/RoutingContext";
import type { RoutingError } from "../models/RoutingError";
import type { RoutingEvent } from "../models/RoutingEvent";
import type { RoutingMetadata } from "../models/RoutingMetadata";
import type { RoutingOperationKind } from "../models/RoutingResult";
import type { RoutingPlan } from "../models/RoutingPlan";
import type { RoutingResult } from "../models/RoutingResult";
import type { RoutingSnapshot } from "../models/RoutingSnapshot";
import type { RoutingSummary } from "../models/RoutingSummary";
import type { RoutingValidation } from "../models/RoutingValidation";
import { freezeResult } from "../utils/FreezeRoutingState";

export interface RoutingResultBuilderInput {
  readonly id: string;
  readonly operation: RoutingOperationKind;
  readonly success: boolean;
  readonly message?: string | null;
  readonly plan?: RoutingPlan | null;
  readonly context?: RoutingContext | null;
  readonly summary?: RoutingSummary | null;
  readonly snapshot?: RoutingSnapshot | null;
  readonly description?: string | null;
  readonly validation?: RoutingValidation;
  readonly error?: RoutingError | null;
  readonly events?: readonly RoutingEvent[];
  readonly metadata?: RoutingMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt?: string;
}

export class RoutingResultBuilder {
  build(input: RoutingResultBuilderInput): RoutingResult {
    return freezeResult({
      id: input.id,
      operation: input.operation,
      success: input.success,
      message: input.message ?? null,
      plan: input.plan ?? null,
      context: input.context ?? null,
      summary: input.summary ?? null,
      snapshot: input.snapshot ?? null,
      description: input.description ?? null,
      validation:
        input.validation ??
        Object.freeze({ valid: true, issues: Object.freeze([]) }),
      error: input.error ?? null,
      events: Object.freeze([...(input.events ?? [])]),
      metadata: input.metadata ?? EMPTY_ROUTING_METADATA,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
      frozenAt: input.frozenAt ?? input.completedAt,
    });
  }
}

export function buildRoutingResult(
  input: RoutingResultBuilderInput,
): RoutingResult {
  return new RoutingResultBuilder().build(input);
}
