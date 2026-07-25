import type { RecoveryMetadata } from "./RecoveryMetadata";

/** Handoff to Recovery Runtime — structural keys only. */
export interface RecoveryRuntimeInput {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly updatedPlanId: string;
  readonly sleepKeys: readonly string[];
  readonly protocolKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
