import type { UpdatedWorkoutBlueprint } from "./UpdatedWorkoutBlueprint";
import type { WorkoutAdaptation } from "./WorkoutAdaptation";
import type { WorkoutComparison } from "./WorkoutComparison";
import type { WorkoutDescriptor } from "./WorkoutDescriptor";
import type { WorkoutError } from "./WorkoutError";
import type { WorkoutPackage } from "./WorkoutPackage";
import type { WorkoutRuntimeInput } from "./WorkoutRuntimeInput";
import type { WorkoutSnapshot } from "./WorkoutSnapshot";
import type { WorkoutSummary } from "./WorkoutSummary";
import type { WorkoutValidation } from "./WorkoutValidation";

export const WorkoutOperationKinds = {
  ADAPT: "adapt",
  COMPARE: "compare",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type WorkoutOperationKind =
  (typeof WorkoutOperationKinds)[keyof typeof WorkoutOperationKinds];

export interface WorkoutResult {
  readonly id: string;
  readonly operation: WorkoutOperationKind;
  readonly success: boolean;
  readonly adaptation: WorkoutAdaptation | null;
  readonly updatedBlueprint: UpdatedWorkoutBlueprint | null;
  readonly runtimeInput: WorkoutRuntimeInput | null;
  readonly package: WorkoutPackage | null;
  readonly summary: WorkoutSummary | null;
  readonly snapshot: WorkoutSnapshot | null;
  readonly comparison: WorkoutComparison | null;
  readonly validation: WorkoutValidation | null;
  readonly descriptor: WorkoutDescriptor | null;
  readonly errors: readonly WorkoutError[];
  readonly createdAt: string;
}
