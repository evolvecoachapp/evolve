import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface ExerciseRemoval {
  readonly id: string;
  readonly exerciseKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
