import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface CardioAdjustment {
  readonly id: string;
  readonly cardioKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
