/**
 * Immutable provider limits (token / rate / concurrency placeholders).
 */
export interface AIProviderLimits {
  readonly maxInputTokens: number | null;
  readonly maxOutputTokens: number | null;
  readonly maxRequestsPerMinute: number | null;
  readonly maxConcurrentRequests: number | null;
  readonly maxContextWindow: number | null;
}

export const UNBOUNDED_LIMITS: AIProviderLimits = Object.freeze({
  maxInputTokens: null,
  maxOutputTokens: null,
  maxRequestsPerMinute: null,
  maxConcurrentRequests: null,
  maxContextWindow: null,
});
