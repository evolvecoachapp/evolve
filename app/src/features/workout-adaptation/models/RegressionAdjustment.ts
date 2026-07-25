import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface RegressionAdjustment {
  readonly id: string;
  readonly regressionKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
