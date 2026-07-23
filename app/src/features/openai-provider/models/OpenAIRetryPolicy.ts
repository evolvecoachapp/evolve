/**
 * Immutable retry policy for OpenAI client / provider configuration.
 */
export interface OpenAIRetryPolicy {
  readonly maxRetries: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly multiplier: number;
  readonly jitter: boolean;
}

export const DEFAULT_OPENAI_RETRY_POLICY: OpenAIRetryPolicy = Object.freeze({
  maxRetries: 0,
  initialDelayMs: 250,
  maxDelayMs: 8_000,
  multiplier: 2,
  jitter: true,
});
