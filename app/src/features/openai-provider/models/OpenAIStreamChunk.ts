/**
 * Immutable OpenAI streaming chunk (provider-layer only).
 *
 * Mapped into AIStreamingChunk / AIResponseChunk at the boundary.
 * No UI. No rendering.
 */
export interface OpenAIStreamChunk {
  readonly id: string;
  readonly index: number;
  readonly delta: string;
  readonly finishReason: string | null;
  readonly model: string | null;
  readonly usage: {
    readonly promptTokens: number;
    readonly completionTokens: number;
    readonly totalTokens: number;
  } | null;
  readonly createdAt: string;
}
