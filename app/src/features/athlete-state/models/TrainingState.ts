/**
 * Immutable training state slice (aggregation only, no load calculations).
 */
export interface TrainingState {
  readonly phase: string | null;
  readonly focus: string | null;
  readonly sessionsPerWeek: number | null;
  readonly lastSessionId: string | null;
  readonly lastSessionAt: string | null;
  readonly programId: string | null;
  readonly notes: readonly string[];
  readonly sourceAgentIds: readonly string[];
}
