import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutAdjustment {
  readonly id: string;
  readonly targetKey: string;
  readonly adjustmentKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
