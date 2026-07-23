/**
 * Lightweight in-memory OpenAI provider statistics helpers.
 *
 * No persistence. No business logic.
 */
export interface OpenAIProviderStatistics {
  readonly requestCount: number;
  readonly successCount: number;
  readonly errorCount: number;
  readonly totalPromptTokens: number;
  readonly totalCompletionTokens: number;
  readonly totalTokens: number;
  readonly lastExecutedAt: string | null;
}

export const EMPTY_OPENAI_STATISTICS: OpenAIProviderStatistics = Object.freeze({
  requestCount: 0,
  successCount: 0,
  errorCount: 0,
  totalPromptTokens: 0,
  totalCompletionTokens: 0,
  totalTokens: 0,
  lastExecutedAt: null,
});

export function recordSuccess(
  stats: OpenAIProviderStatistics,
  usage: {
    readonly promptTokens: number;
    readonly completionTokens: number;
    readonly totalTokens: number;
  },
  executedAt: string,
): OpenAIProviderStatistics {
  return Object.freeze({
    requestCount: stats.requestCount + 1,
    successCount: stats.successCount + 1,
    errorCount: stats.errorCount,
    totalPromptTokens: stats.totalPromptTokens + usage.promptTokens,
    totalCompletionTokens:
      stats.totalCompletionTokens + usage.completionTokens,
    totalTokens: stats.totalTokens + usage.totalTokens,
    lastExecutedAt: executedAt,
  });
}

export function recordError(
  stats: OpenAIProviderStatistics,
  executedAt: string,
): OpenAIProviderStatistics {
  return Object.freeze({
    ...stats,
    requestCount: stats.requestCount + 1,
    errorCount: stats.errorCount + 1,
    lastExecutedAt: executedAt,
  });
}
