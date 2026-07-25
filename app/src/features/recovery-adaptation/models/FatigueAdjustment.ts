import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface FatigueAdjustment {
  readonly id: string;
  readonly fatigueKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
