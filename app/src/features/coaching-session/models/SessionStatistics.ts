export interface SessionStatistics {
  readonly turnCount: number;
  readonly eventCount: number;
  readonly checkpointCount: number;
  readonly agentInvocationCount: number;
  readonly successCount: number;
  readonly failureCount: number;
}

export const EMPTY_SESSION_STATISTICS: SessionStatistics = Object.freeze({
  turnCount: 0,
  eventCount: 0,
  checkpointCount: 0,
  agentInvocationCount: 0,
  successCount: 0,
  failureCount: 0,
});
