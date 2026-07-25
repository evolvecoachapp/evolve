import type { UpdatedWorkoutBlueprint } from "./UpdatedWorkoutBlueprint";
import type { WorkoutAdaptation } from "./WorkoutAdaptation";
import type { WorkoutPackage } from "./WorkoutPackage";
import type { WorkoutRuntimeInput } from "./WorkoutRuntimeInput";
import type { WorkoutSnapshot } from "./WorkoutSnapshot";
import type { WorkoutSummary } from "./WorkoutSummary";

export interface WorkoutAdaptationOutput {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly adaptation: WorkoutAdaptation | null;
  readonly updatedBlueprint: UpdatedWorkoutBlueprint | null;
  readonly runtimeInput: WorkoutRuntimeInput | null;
  readonly package: WorkoutPackage | null;
  readonly summary: WorkoutSummary | null;
  readonly snapshot: WorkoutSnapshot | null;
  readonly createdAt: string;
}
