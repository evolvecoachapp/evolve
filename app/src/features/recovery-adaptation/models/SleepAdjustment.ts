import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface SleepAdjustment {
  readonly id: string;
  readonly sleepKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
