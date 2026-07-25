import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface FatigueAdjustment {
  readonly id: string;
  readonly fatigueKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
