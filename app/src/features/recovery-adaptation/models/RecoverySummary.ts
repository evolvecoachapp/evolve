import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface RecoverySummary {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptationId: string | null;
  readonly modificationCount: number;
  readonly adjustmentCount: number;
  readonly decisionKeys: readonly string[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
