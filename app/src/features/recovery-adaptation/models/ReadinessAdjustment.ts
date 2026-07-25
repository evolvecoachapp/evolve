import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface ReadinessAdjustment {
  readonly id: string;
  readonly readinessKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
