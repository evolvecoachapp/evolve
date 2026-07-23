import type { AIFinishReason } from "./AIFinishReason";
import type { AITokenUsage } from "./AITokenUsage";
import type { AIToolCall } from "./AIToolCall";

/**
 * Immutable streaming chunk contract (alias surface over AIResponseChunk).
 *
 * No streaming execution in this foundation.
 */
export interface AIStreamingChunk {
  readonly id: string;
  readonly requestId: string;
  readonly index: number;
  readonly delta: string;
  readonly finishReason: AIFinishReason | null;
  readonly usage: AITokenUsage | null;
  readonly toolCalls: readonly AIToolCall[];
  readonly createdAt: string;
}
