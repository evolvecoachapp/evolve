import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface RecoveryDayAdjustment {
  readonly id: string;
  readonly dayKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
