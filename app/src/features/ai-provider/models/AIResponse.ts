import type { AIFinishReason } from "./AIFinishReason";
import type { AIProviderId } from "./AIProviderId";
import type { AIProviderMetadata } from "./AIProviderMetadata";
import type { AITokenUsage } from "./AITokenUsage";

/**
 * Standardized immutable AI response contract.
 *
 * Future providers map vendor payloads into this shape.
 * This foundation does not produce live responses.
 */
export interface AIResponse {
  readonly id: string;
  readonly requestId: string;
  readonly providerId: AIProviderId;
  readonly modelId: string | null;
  readonly content: string;
  readonly finishReason: AIFinishReason;
  readonly usage: AITokenUsage;
  readonly metadata: AIProviderMetadata;
  readonly createdAt: string;
}
