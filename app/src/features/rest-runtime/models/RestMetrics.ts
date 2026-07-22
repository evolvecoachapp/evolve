/**
 * Structural rest runtime counters — not analytics.
 */
export interface RestMetrics {
  readonly targetDurationMs: number;
  readonly elapsedMs: number;
  readonly remainingMs: number;
  readonly overtimeMs: number;
  readonly pauseCount: number;
  readonly eventCount: number;
  readonly updateCount: number;
}
