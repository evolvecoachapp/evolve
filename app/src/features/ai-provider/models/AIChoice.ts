import type { AIFinishReason } from "./AIFinishReason";
import type { AIMessage } from "./AIMessage";
import type { AIToolCall } from "./AIToolCall";

/**
 * Immutable response choice within a standardized AI response.
 */
export interface AIChoice {
  readonly index: number;
  readonly message: AIMessage;
  readonly finishReason: AIFinishReason;
  readonly toolCalls: readonly AIToolCall[];
}
