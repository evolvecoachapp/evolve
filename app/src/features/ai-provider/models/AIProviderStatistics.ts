/**
 * Immutable provider statistics placeholders (orchestration metadata only).
 */
export interface AIProviderStatistics {
  readonly registeredModelCount: number;
  readonly enabledCapabilityCount: number;
  readonly requestCount: number;
  readonly successCount: number;
  readonly errorCount: number;
  readonly averageLatencyMs: number | null;
  readonly lastUsedAt: string | null;
}

export const EMPTY_PROVIDER_STATISTICS: AIProviderStatistics = Object.freeze({
  registeredModelCount: 0,
  enabledCapabilityCount: 0,
  requestCount: 0,
  successCount: 0,
  errorCount: 0,
  averageLatencyMs: null,
  lastUsedAt: null,
});
