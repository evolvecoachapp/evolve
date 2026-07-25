import type { DecisionResult } from "../models/DecisionResult";
import type { DecisionOperationKind } from "../models/DecisionResult";
import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionPackage } from "../models/DecisionPackage";
import type { DecisionSummary } from "../models/DecisionSummary";
import type { DecisionSnapshot } from "../models/DecisionSnapshot";
import type { RecommendationEngineInput } from "../models/RecommendationEngineInput";
import type { DecisionValidation } from "../models/DecisionValidation";
import type { DecisionDescriptor } from "../models/DecisionDescriptor";
import type { DecisionError } from "../models/DecisionError";
import { freezeResult } from "../utils/FreezeDecisionState";

export function buildDecisionResult(input: {
  readonly id: string;
  readonly operation: DecisionOperationKind;
  readonly success: boolean;
  readonly decisions?: readonly CoachingDecision[];
  readonly package?: DecisionPackage | null;
  readonly summary?: DecisionSummary | null;
  readonly snapshot?: DecisionSnapshot | null;
  readonly recommendationInput?: RecommendationEngineInput | null;
  readonly validation?: DecisionValidation | null;
  readonly descriptor?: DecisionDescriptor | null;
  readonly errors?: readonly DecisionError[];
  readonly createdAt: string;
}): DecisionResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    decisions: Object.freeze([...(input.decisions ?? [])]),
    package: input.package ?? null,
    summary: input.summary ?? null,
    snapshot: input.snapshot ?? null,
    recommendationInput: input.recommendationInput ?? null,
    validation: input.validation ?? null,
    descriptor: input.descriptor ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    createdAt: input.createdAt,
  });
}
