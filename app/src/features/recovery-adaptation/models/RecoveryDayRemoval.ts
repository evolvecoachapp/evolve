import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface RecoveryDayRemoval {
  readonly id: string;
  readonly dayKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
