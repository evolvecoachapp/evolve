import type { AIModel } from "./AIModel";
import type { AIProviderType } from "./AIProviderType";
import type { ChatMessage } from "./ChatMessage";
import type { TokenUsage } from "./TokenUsage";

/** Structured generation result from an AIProvider. */
export interface AIResponse {
  readonly message: ChatMessage;
  readonly model: AIModel;
  readonly usage: TokenUsage;
  readonly provider: AIProviderType;
  /** ISO-8601 timestamp when the response was generated. */
  readonly generatedAt: string;
}
