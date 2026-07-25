import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationDescriptor } from "../models/AdaptationDescriptor";
import type { AdaptationError } from "../models/AdaptationError";
import type { AdaptationPackage } from "../models/AdaptationPackage";
import type {
  AdaptationOperationKind,
  AdaptationResult,
} from "../models/AdaptationResult";
import type { AdaptationSnapshot } from "../models/AdaptationSnapshot";
import type { AdaptationSummary } from "../models/AdaptationSummary";
import type { AdaptationValidation } from "../models/AdaptationValidation";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";
import { freezeResult } from "../utils/FreezeAdaptationState";

export function buildAdaptationResult(input: {
  readonly id: string;
  readonly operation: AdaptationOperationKind;
  readonly success: boolean;
  readonly decisions?: readonly AdaptationDecision[];
  readonly package?: AdaptationPackage | null;
  readonly summary?: AdaptationSummary | null;
  readonly snapshot?: AdaptationSnapshot | null;
  readonly workoutAdaptationInput?: WorkoutAdaptationInput | null;
  readonly nutritionAdaptationInput?: NutritionAdaptationInput | null;
  readonly recoveryAdaptationInput?: RecoveryAdaptationInput | null;
  readonly goalProgressInput?: GoalProgressInput | null;
  readonly validation?: AdaptationValidation | null;
  readonly descriptor?: AdaptationDescriptor | null;
  readonly errors?: readonly AdaptationError[];
  readonly createdAt: string;
}): AdaptationResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    decisions: Object.freeze([...(input.decisions ?? [])]),
    package: input.package ?? null,
    summary: input.summary ?? null,
    snapshot: input.snapshot ?? null,
    workoutAdaptationInput: input.workoutAdaptationInput ?? null,
    nutritionAdaptationInput: input.nutritionAdaptationInput ?? null,
    recoveryAdaptationInput: input.recoveryAdaptationInput ?? null,
    goalProgressInput: input.goalProgressInput ?? null,
    validation: input.validation ?? null,
    descriptor: input.descriptor ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    createdAt: input.createdAt,
  });
}
