import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WeeklyAdjustment {
  readonly id: string;
  readonly weekKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
