/**
 * Immutable build context shared across history entries and aggregates.
 */
export interface HistoryContext {
  readonly athleteId: string | null;
  readonly sessionId: string | null;
  readonly runtimeId: string | null;
  readonly dayId: string | null;
  readonly weekNumber: number | null;
  readonly eventStreamId: string | null;
  readonly performanceSnapshotId: string | null;
  readonly achievementEvaluationId: string | null;
  readonly builtAt: string;
}
