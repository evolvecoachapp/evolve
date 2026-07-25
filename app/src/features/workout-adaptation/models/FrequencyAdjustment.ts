import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface FrequencyAdjustment {
  readonly id: string;
  readonly frequencyKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
