import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface WeeklyAdjustment {
  readonly id: string;
  readonly weekKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
