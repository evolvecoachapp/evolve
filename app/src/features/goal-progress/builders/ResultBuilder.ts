import type { ContinuousAdaptationInput } from "../models/ContinuousAdaptationInput";
import type { GoalDescriptor } from "../models/GoalDescriptor";
import type { GoalError } from "../models/GoalError";
import type { GoalPackage } from "../models/GoalPackage";
import type { GoalProgress } from "../models/GoalProgress";
import type { GoalOperationKind, GoalResult } from "../models/GoalResult";
import type { GoalSnapshot } from "../models/GoalSnapshot";
import type { GoalSummary } from "../models/GoalSummary";
import type { GoalValidation } from "../models/GoalValidation";
import { freezeResult } from "../utils/FreezeGoalProgress";

export function buildGoalResult(input: {
  readonly id: string;
  readonly operation: GoalOperationKind;
  readonly success: boolean;
  readonly decisions?: readonly GoalProgress[];
  readonly package?: GoalPackage | null;
  readonly summary?: GoalSummary | null;
  readonly snapshot?: GoalSnapshot | null;
  readonly continuousAdaptationInput?: ContinuousAdaptationInput | null;
  readonly validation?: GoalValidation | null;
  readonly descriptor?: GoalDescriptor | null;
  readonly errors?: readonly GoalError[];
  readonly createdAt: string;
}): GoalResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    decisions: Object.freeze([...(input.decisions ?? [])]),
    package: input.package ?? null,
    summary: input.summary ?? null,
    snapshot: input.snapshot ?? null,
    continuousAdaptationInput: input.continuousAdaptationInput ?? null,
    validation: input.validation ?? null,
    descriptor: input.descriptor ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    createdAt: input.createdAt,
  });
}
