import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface RecoveryHistoryEntry {
  readonly id: string;
  readonly adaptationId: string;
  readonly planId: string;
  readonly keys: readonly string[];
  readonly createdAt: string;
}

export interface RecoveryHistory {
  readonly id: string;
  readonly athleteId: string;
  readonly entries: readonly RecoveryHistoryEntry[];
  readonly historyKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
