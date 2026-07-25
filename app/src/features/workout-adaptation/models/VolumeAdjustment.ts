import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface VolumeAdjustment {
  readonly id: string;
  readonly volumeKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
