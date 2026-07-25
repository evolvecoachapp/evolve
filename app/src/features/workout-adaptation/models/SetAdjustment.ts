import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface SetAdjustment {
  readonly id: string;
  readonly setKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
