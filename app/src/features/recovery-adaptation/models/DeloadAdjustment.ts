import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface DeloadAdjustment {
  readonly id: string;
  readonly deloadKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
