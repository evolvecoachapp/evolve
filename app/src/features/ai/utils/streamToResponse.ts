import type { AIFinishReason } from "../models/AIFinishReason";
import type { AIModel } from "../models/AIModel";
import type { AIProviderType } from "../models/AIProviderType";
import type { AIResponse } from "../models/AIResponse";
import type { AIStreamChunk } from "../models/AIStreamChunk";
import type { TokenUsage } from "../models/TokenUsage";
import { aggregateChunks } from "./aggregateChunks";

export interface StreamToResponseInput {
  readonly messageId: string;
  readonly chunks: readonly AIStreamChunk[];
  readonly model: AIModel;
  readonly provider: AIProviderType;
  readonly finishReason: AIFinishReason;
  readonly usage: TokenUsage;
  readonly generatedAt: string;
}

/**
 * Build a completed AIResponse from accumulated stream chunks.
 *
 * No formatting — content is the raw aggregated delta text.
 */
export function streamToResponse(input: StreamToResponseInput): AIResponse {
  const content = aggregateChunks(input.chunks);

  return Object.freeze({
    message: Object.freeze({
      id: input.messageId,
      role: "assistant" as const,
      content,
      createdAt: input.generatedAt,
    }),
    model: input.model,
    usage: input.usage,
    provider: input.provider,
    finishReason: input.finishReason,
    generatedAt: input.generatedAt,
  });
}
