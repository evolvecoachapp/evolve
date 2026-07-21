import type { AIFinishReason } from "../../models/AIFinishReason";
import type { AIStreamEvent } from "../../models/AIStreamEvent";
import type { TokenUsage } from "../../models/TokenUsage";
import type { OpenAIChatCompletionsStreamChunk } from "./OpenAITypes";

export interface OpenAIStreamMapperContext {
  readonly sessionId: string;
  readonly messageId: string;
  readonly createdAt: string;
  readonly chunkIndex: number;
}

/**
 * Maps OpenAI SSE chat.completion.chunk payloads → AIStreamEvent.
 *
 * Transport/parsing stay outside this mapper — it only translates shapes.
 */
export class OpenAIStreamMapper {
  static mapDelta(
    chunk: OpenAIChatCompletionsStreamChunk,
    context: OpenAIStreamMapperContext,
  ): AIStreamEvent | null {
    const choice = chunk.choices?.[0];
    const delta = choice?.delta?.content;

    if (typeof delta !== "string" || delta.length === 0) {
      return null;
    }

    return Object.freeze({
      type: "chunk" as const,
      sessionId: context.sessionId,
      chunk: Object.freeze({
        id: `${context.sessionId}-chunk-${context.chunkIndex}`,
        delta,
        index: context.chunkIndex,
        createdAt: context.createdAt,
      }),
    });
  }

  static mapFinishReason(reason: string | null | undefined): AIFinishReason {
    switch (reason) {
      case "stop":
        return "stop";
      case "length":
        return "length";
      case "content_filter":
        return "content_filter";
      case null:
      case undefined:
      case "":
        return "stop";
      default:
        return "unknown";
    }
  }

  static mapUsage(
    usage: OpenAIChatCompletionsStreamChunk["usage"],
    fallback: TokenUsage,
  ): TokenUsage {
    if (!usage) {
      return fallback;
    }

    const promptTokens = usage.prompt_tokens ?? fallback.promptTokens;
    const completionTokens =
      usage.completion_tokens ?? fallback.completionTokens;
    const totalTokens =
      usage.total_tokens ?? promptTokens + completionTokens;

    return Object.freeze({
      promptTokens,
      completionTokens,
      totalTokens,
    });
  }

  /**
   * Parse one SSE data line (`data: {...}` or bare JSON) into a vendor chunk.
   * Returns null for keep-alives / [DONE].
   */
  static parseSseDataLine(
    line: string,
  ): OpenAIChatCompletionsStreamChunk | null | "done" {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(":")) {
      return null;
    }

    const payload = trimmed.startsWith("data:")
      ? trimmed.slice("data:".length).trim()
      : trimmed;

    if (!payload) {
      return null;
    }

    if (payload === "[DONE]") {
      return "done";
    }

    try {
      return JSON.parse(payload) as OpenAIChatCompletionsStreamChunk;
    } catch {
      return null;
    }
  }
}
