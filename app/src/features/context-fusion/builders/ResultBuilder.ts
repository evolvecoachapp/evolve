import type { ContextDescriptor } from "../models/ContextDescriptor";
import type { ContextError } from "../models/ContextError";
import type { ContextPackage } from "../models/ContextPackage";
import type { ContextResult } from "../models/ContextResult";
import type { ContextSnapshot } from "../models/ContextSnapshot";
import type { ContextSummary } from "../models/ContextSummary";
import type { ContextValidation } from "../models/ContextValidation";
import type { ContextOperationKind } from "../models/ContextResult";
import type { DecisionEngineContext } from "../models/DecisionEngineContext";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { freezeResult } from "../utils/FreezeContext";

export function buildContextResult(input: {
  readonly id: string;
  readonly operation: ContextOperationKind;
  readonly success: boolean;
  readonly message: string;
  readonly athleteId?: string | null;
  readonly context?: UnifiedCoachingContext | null;
  readonly snapshot?: ContextSnapshot | null;
  readonly summary?: ContextSummary | null;
  readonly package?: ContextPackage | null;
  readonly decisionEngineContext?: DecisionEngineContext | null;
  readonly descriptor?: ContextDescriptor | null;
  readonly validation?: ContextValidation | null;
  readonly error?: ContextError | null;
  readonly startedAt: string;
  readonly completedAt: string;
}): ContextResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    message: input.message,
    athleteId: input.athleteId ?? null,
    context: input.context ?? null,
    snapshot: input.snapshot ?? null,
    summary: input.summary ?? null,
    package: input.package ?? null,
    decisionEngineContext: input.decisionEngineContext ?? null,
    descriptor: input.descriptor ?? null,
    validation: input.validation ?? null,
    error: input.error ?? null,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
  });
}
