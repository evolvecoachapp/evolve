import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface HRVAdjustment {
  readonly id: string;
  readonly hrvKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
