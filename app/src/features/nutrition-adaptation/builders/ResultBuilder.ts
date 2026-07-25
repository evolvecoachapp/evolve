import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionComparison } from "../models/NutritionComparison";
import type { NutritionDescriptor } from "../models/NutritionDescriptor";
import type { NutritionError } from "../models/NutritionError";
import type { NutritionPackage } from "../models/NutritionPackage";
import type {
  NutritionOperationKind,
  NutritionResult,
} from "../models/NutritionResult";
import type { NutritionRuntimeInput } from "../models/NutritionRuntimeInput";
import type { NutritionSnapshot } from "../models/NutritionSnapshot";
import type { NutritionSummary } from "../models/NutritionSummary";
import type { NutritionValidation } from "../models/NutritionValidation";
import type { UpdatedNutritionPlan } from "../models/UpdatedNutritionPlan";
import { freezeResult } from "../utils/FreezeNutritionAdaptation";

export function buildNutritionResult(input: {
  readonly id: string;
  readonly operation: NutritionOperationKind;
  readonly success: boolean;
  readonly adaptation?: NutritionAdaptation | null;
  readonly updatedPlan?: UpdatedNutritionPlan | null;
  readonly runtimeInput?: NutritionRuntimeInput | null;
  readonly package?: NutritionPackage | null;
  readonly summary?: NutritionSummary | null;
  readonly snapshot?: NutritionSnapshot | null;
  readonly comparison?: NutritionComparison | null;
  readonly validation?: NutritionValidation | null;
  readonly descriptor?: NutritionDescriptor | null;
  readonly errors?: readonly NutritionError[];
  readonly createdAt: string;
}): NutritionResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    adaptation: input.adaptation ?? null,
    updatedPlan: input.updatedPlan ?? null,
    runtimeInput: input.runtimeInput ?? null,
    package: input.package ?? null,
    summary: input.summary ?? null,
    snapshot: input.snapshot ?? null,
    comparison: input.comparison ?? null,
    validation: input.validation ?? null,
    descriptor: input.descriptor ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    createdAt: input.createdAt,
  });
}
