import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface ExerciseAdjustment {
  readonly id: string;
  readonly exerciseKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
