import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface ExerciseReplacement {
  readonly id: string;
  readonly fromExerciseKey: string;
  readonly toExerciseKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
