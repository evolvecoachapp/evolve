import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface RecoveryProtocolAdjustment {
  readonly id: string;
  readonly protocolKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
