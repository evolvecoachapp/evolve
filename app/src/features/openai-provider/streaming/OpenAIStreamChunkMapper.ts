import type { AIFinishReason } from "../../ai-provider/models/AIFinishReason";
import { AIFinishReasons } from "../../ai-provider/models/AIFinishReason";
import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import type { AIStreamingChunk } from "../../ai-provider/models/AIStreamingChunk";
import type { AIResponseChunk } from "../../ai-provider/models/AIResponseChunk";
import type { OpenAIStreamChunk } from "../models/OpenAIStreamChunk";
import { OpenAIUsageMapper } from "../mappers/OpenAIUsageMapper";

export interface StreamChunkMapperContext {
  readonly requestId: string;
  readonly createdAt?: string;
}

/**
 * Maps provider-layer OpenAIStreamChunk → AIStreamingChunk / AIResponseChunk.
 *
 * No UI. No rendering. Supports future incremental chunks.
 */
export class OpenAIStreamChunkMapper {
  static toStreamingChunk(
    chunk: OpenAIStreamChunk,
    context: StreamChunkMapperContext,
  ): AIStreamingChunk {
    const usage = chunk.usage
      ? OpenAIUsageMapper.toTokenUsage(chunk.usage)
      : null;

    return Object.freeze({
      id: chunk.id,
      requestId: context.requestId,
      index: chunk.index,
      delta: chunk.delta,
      finishReason: mapFinishReason(chunk.finishReason),
      usage,
      toolCalls: Object.freeze([]),
      createdAt: context.createdAt ?? chunk.createdAt,
    });
  }

  static toResponseChunk(
    chunk: OpenAIStreamChunk,
    context: StreamChunkMapperContext,
  ): AIResponseChunk {
    const usage = chunk.usage
      ? OpenAIUsageMapper.toTokenUsage(chunk.usage)
      : null;

    return Object.freeze({
      id: chunk.id,
      requestId: context.requestId,
      providerId: AIProviderIds.OPENAI,
      index: chunk.index,
      delta: chunk.delta,
      finishReason: mapFinishReason(chunk.finishReason),
      usage,
      createdAt: context.createdAt ?? chunk.createdAt,
    });
  }
}

function mapFinishReason(
  reason: string | null | undefined,
): AIFinishReason | null {
  if (reason == null || reason === "") {
    return null;
  }
  switch (reason) {
    case "stop":
      return AIFinishReasons.STOP;
    case "length":
      return AIFinishReasons.LENGTH;
    case "content_filter":
      return AIFinishReasons.CONTENT_FILTER;
    case "tool_calls":
    case "function_call":
      return AIFinishReasons.TOOL_CALLS;
    default:
      return AIFinishReasons.UNKNOWN;
  }
}
