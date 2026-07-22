/**
 * Session linkage for a conversation context.
 * Upstream ids only — no chat persistence or AI state.
 */
export interface ConversationSession {
  readonly athleteId: string | null;
  readonly sessionId: string | null;
  readonly runtimeId: string | null;
  readonly dayId: string | null;
  readonly weekNumber: number | null;
  readonly coachingContextId: string;
  readonly insightSnapshotId: string | null;
  readonly performanceSnapshotId: string | null;
  readonly achievementEvaluationId: string | null;
  readonly recoverySnapshotId: string | null;
  readonly historyId: string | null;
  readonly preparedAt: string;
}
