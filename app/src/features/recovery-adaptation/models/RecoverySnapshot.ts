import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface RecoverySnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptationId: string | null;
  readonly planKeys: readonly string[];
  readonly dayKeys: readonly string[];
  readonly sleepKeys: readonly string[];
  readonly protocolKeys: readonly string[];
  readonly mobilityKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
