import type { WorkoutMetadata } from "./WorkoutMetadata";

/** Handoff to Workout Runtime — structural keys only. */
export interface WorkoutRuntimeInput {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly updatedBlueprintId: string;
  readonly sessionKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
