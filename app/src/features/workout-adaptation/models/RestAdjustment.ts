import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface RestAdjustment {
  readonly id: string;
  readonly restKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
