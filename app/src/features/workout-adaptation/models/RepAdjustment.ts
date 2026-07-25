import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface RepAdjustment {
  readonly id: string;
  readonly repKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
