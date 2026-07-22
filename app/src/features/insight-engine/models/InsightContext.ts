/**
 * Shared generation context linking upstream domain snapshots.
 */
export interface InsightContext {
  readonly athleteId: string | null;
  readonly sessionId: string | null;
  readonly runtimeId: string | null;
  readonly dayId: string | null;
  readonly weekNumber: number | null;
  readonly performanceSnapshotId: string | null;
  readonly achievementEvaluationId: string | null;
  readonly recoverySnapshotId: string | null;
  readonly historyId: string | null;
  readonly generatedAt: string;
}
