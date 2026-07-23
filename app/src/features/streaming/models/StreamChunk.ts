/**
 * Immutable provider-agnostic stream chunk.
 *
 * Carries a text delta and ordered index. No provider-specific payload.
 */
export interface StreamChunk {
  readonly id: string;
  readonly streamId: string;
  readonly index: number;
  readonly delta: string;
  readonly isFinal: boolean;
  readonly finishReason: string | null;
  readonly createdAt: string;
}
