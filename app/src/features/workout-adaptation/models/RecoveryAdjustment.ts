import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface RecoveryAdjustment {
  readonly id: string;
  readonly recoveryKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
