import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface StretchingAdjustment {
  readonly id: string;
  readonly stretchingKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
