/**
 * Immutable recovery state slice.
 */
export interface RecoveryState {
  readonly status: string | null;
  readonly lastRecoverySessionId: string | null;
  readonly lastAssessedAt: string | null;
  readonly modalities: readonly string[];
  readonly notes: readonly string[];
  readonly sourceAgentIds: readonly string[];
}
