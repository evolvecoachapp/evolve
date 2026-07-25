import type { RecoveryMetadata } from "./RecoveryMetadata";

/** Structure keys only — NOT full recovery generation. */
export interface UpdatedRecoveryPlan {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly dayKeys: readonly string[];
  readonly sleepKeys: readonly string[];
  readonly protocolKeys: readonly string[];
  readonly mobilityKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
