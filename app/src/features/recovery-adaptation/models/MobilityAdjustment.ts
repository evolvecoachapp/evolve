import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface MobilityAdjustment {
  readonly id: string;
  readonly mobilityKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
