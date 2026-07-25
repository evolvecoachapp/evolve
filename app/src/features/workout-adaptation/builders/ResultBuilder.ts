import type { UpdatedWorkoutBlueprint } from "../models/UpdatedWorkoutBlueprint";
import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import type { WorkoutComparison } from "../models/WorkoutComparison";
import type { WorkoutDescriptor } from "../models/WorkoutDescriptor";
import type { WorkoutError } from "../models/WorkoutError";
import type { WorkoutPackage } from "../models/WorkoutPackage";
import type {
  WorkoutOperationKind,
  WorkoutResult,
} from "../models/WorkoutResult";
import type { WorkoutRuntimeInput } from "../models/WorkoutRuntimeInput";
import type { WorkoutSnapshot } from "../models/WorkoutSnapshot";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { freezeResult } from "../utils/FreezeWorkoutAdaptation";

export function buildWorkoutResult(input: {
  readonly id: string;
  readonly operation: WorkoutOperationKind;
  readonly success: boolean;
  readonly adaptation?: WorkoutAdaptation | null;
  readonly updatedBlueprint?: UpdatedWorkoutBlueprint | null;
  readonly runtimeInput?: WorkoutRuntimeInput | null;
  readonly package?: WorkoutPackage | null;
  readonly summary?: WorkoutSummary | null;
  readonly snapshot?: WorkoutSnapshot | null;
  readonly comparison?: WorkoutComparison | null;
  readonly validation?: WorkoutValidation | null;
  readonly descriptor?: WorkoutDescriptor | null;
  readonly errors?: readonly WorkoutError[];
  readonly createdAt: string;
}): WorkoutResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    adaptation: input.adaptation ?? null,
    updatedBlueprint: input.updatedBlueprint ?? null,
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
