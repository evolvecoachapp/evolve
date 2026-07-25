import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface ExerciseInsertion {
  readonly id: string;
  readonly exerciseKey: string;
  readonly afterKey: string | null;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
