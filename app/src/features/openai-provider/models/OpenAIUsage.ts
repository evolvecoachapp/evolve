/**
 * Immutable OpenAI token usage snapshot.
 */
export interface OpenAIUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

export const ZERO_OPENAI_USAGE: OpenAIUsage = Object.freeze({
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
});
