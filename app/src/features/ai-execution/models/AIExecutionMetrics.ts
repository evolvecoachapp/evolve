/**
 * Immutable execution metrics collected by the pipeline.
 */
export interface AIExecutionMetrics {
  readonly durationMs: number | null;
  readonly stageDurationsMs: Readonly<Record<string, number>>;
  readonly providerLatencyMs: number | null;
  readonly attemptCount: number;
  readonly tokenUsage: Readonly<{
    readonly promptTokens: number | null;
    readonly completionTokens: number | null;
    readonly totalTokens: number | null;
  }> | null;
}

export const EMPTY_EXECUTION_METRICS: AIExecutionMetrics = Object.freeze({
  durationMs: null,
  stageDurationsMs: Object.freeze({}),
  providerLatencyMs: null,
  attemptCount: 0,
  tokenUsage: null,
});
