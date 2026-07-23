/**
 * Immutable agent statistics counters.
 */
export interface AgentStatistics {
  readonly registrationCount: number;
  readonly resolveCount: number;
  readonly sessionCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly averageDurationMs: number;
  readonly lastResolvedAt: string | null;
  readonly lastCompletedAt: string | null;
}

export const EMPTY_AGENT_STATISTICS: AgentStatistics = Object.freeze({
  registrationCount: 0,
  resolveCount: 0,
  sessionCount: 0,
  successCount: 0,
  failureCount: 0,
  averageDurationMs: 0,
  lastResolvedAt: null,
  lastCompletedAt: null,
});
