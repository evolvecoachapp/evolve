import type { OpenAIMessage } from "./OpenAIMessage";

/**
 * Immutable OpenAI chat completion choice.
 */
export interface OpenAIChoice {
  readonly index: number;
  readonly message: OpenAIMessage;
  readonly finishReason: string | null;
}
