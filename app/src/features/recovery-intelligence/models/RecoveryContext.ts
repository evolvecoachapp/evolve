/**
 * Analysis context for a recovery snapshot.
 * Achievement evaluation id is reference metadata only.
 */
export interface RecoveryContext {
  readonly athleteId: string | null;
  readonly sessionId: string | null;
  readonly runtimeId: string | null;
  readonly dayId: string | null;
  readonly weekNumber: number | null;
  readonly historyId: string | null;
  readonly performanceSnapshotId: string | null;
  readonly achievementEvaluationId: string | null;
  readonly analyzedAt: string;
  /** Lookback window (days) used for frequency / cumulative load. */
  readonly frequencyWindowDays: number;
}
