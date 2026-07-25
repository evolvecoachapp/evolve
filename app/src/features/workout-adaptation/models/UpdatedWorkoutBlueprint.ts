import type { WorkoutMetadata } from "./WorkoutMetadata";

/** Structure keys only — NOT full workout generation. */
export interface UpdatedWorkoutBlueprint {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly dayKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
  readonly sessionKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
