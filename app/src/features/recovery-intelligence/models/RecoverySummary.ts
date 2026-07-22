import type { RecoveryStatusLevel } from "./RecoveryStatus";

/**
 * Compact public summary of a recovery analysis.
 */
export interface RecoverySummary {
  readonly snapshotId: string;
  readonly athleteId: string | null;
  readonly status: RecoveryStatusLevel;
  readonly fatigueScore: number;
  readonly sessionLoad: number;
  readonly workoutsInWindow: number;
  readonly windowDurationHours: number;
  readonly summaryText: string;
}
