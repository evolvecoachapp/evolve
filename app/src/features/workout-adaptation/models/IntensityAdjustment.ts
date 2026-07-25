import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface IntensityAdjustment {
  readonly id: string;
  readonly intensityKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
