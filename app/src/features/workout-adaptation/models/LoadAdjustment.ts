import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface LoadAdjustment {
  readonly id: string;
  readonly loadKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
