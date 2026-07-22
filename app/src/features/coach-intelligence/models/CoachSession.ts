/**
 * Session linkage for a coaching context.
 * Upstream ids only — no conversation state.
 */
export interface CoachSession {
  readonly athleteId: string | null;
  readonly sessionId: string | null;
  readonly runtimeId: string | null;
  readonly dayId: string | null;
  readonly weekNumber: number | null;
  readonly insightSnapshotId: string;
  readonly performanceSnapshotId: string | null;
  readonly achievementEvaluationId: string | null;
  readonly recoverySnapshotId: string | null;
  readonly historyId: string | null;
  readonly preparedAt: string;
}
