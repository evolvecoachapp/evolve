import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface RecoveryAdjustment {
  readonly id: string;
  readonly targetKey: string;
  readonly adjustmentKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
