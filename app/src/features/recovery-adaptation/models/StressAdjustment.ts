import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface StressAdjustment {
  readonly id: string;
  readonly stressKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
