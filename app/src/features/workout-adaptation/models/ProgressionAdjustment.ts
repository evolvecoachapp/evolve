import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface ProgressionAdjustment {
  readonly id: string;
  readonly progressionKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
