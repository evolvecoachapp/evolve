import type { AIModel } from "../models/AIModel";
import type { AIProviderInfo } from "../models/AIProviderInfo";
import type { AIProviderType } from "../models/AIProviderType";
import type { AIRequest } from "../models/AIRequest";
import type { AIResponse } from "../models/AIResponse";
import type { ChatMessage } from "../models/ChatMessage";

export interface StubProviderConfig {
  readonly type: AIProviderType;
  readonly name: string;
  readonly model: AIModel;
  readonly sampleContent: string;
}

/**
 * Build a deterministic stub AIResponse for testing.
 *
 * No networking — fixed identity fields with usage derived from request size.
 */
export function createStubResponse(
  config: StubProviderConfig,
  request: AIRequest,
): AIResponse {
  const generatedAt = request.promptGeneratedAt;
  const message: ChatMessage = Object.freeze({
    id: `msg-stub-${config.type}`,
    role: "assistant",
    content: config.sampleContent,
    createdAt: generatedAt,
  });

  const promptTokens = Math.max(1, request.messages.length) * 12;
  const completionTokens = 24;

  return Object.freeze({
    message,
    model: config.model,
    usage: Object.freeze({
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    }),
    provider: config.type,
    finishReason: "stop" as const,
    generatedAt,
  });
}

export function createStubProviderInfo(
  config: StubProviderConfig,
): AIProviderInfo {
  return Object.freeze({
    type: config.type,
    name: config.name,
    model: config.model,
  });
}
