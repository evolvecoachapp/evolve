import type { AIFinishReason } from "../../models/AIFinishReason";
import type { AIModel } from "../../models/AIModel";
import type { AIResponse } from "../../models/AIResponse";
import type { ChatMessage } from "../../models/ChatMessage";
import type { TokenUsage } from "../../models/TokenUsage";
import { AIError } from "../../models/AIError";
import type { OpenAIChatCompletionsResponse } from "./OpenAITypes";

export interface OpenAIResponseMapperContext {
  readonly model: AIModel;
  readonly generatedAt: string;
}

/**
 * Maps OpenAI Chat Completions JSON → AIResponse.
 *
 * Vendor response shapes never leave this mapper.
 */
export class OpenAIResponseMapper {
  static map(
    payload: OpenAIChatCompletionsResponse,
    context: OpenAIResponseMapperContext,
  ): AIResponse {
    const choice = payload.choices?.[0];
    const content = choice?.message?.content;

    if (typeof content !== "string" || content.length === 0) {
      throw new AIError(
        "invalid_response",
        "OpenAI response missing assistant content",
        "openai",
      );
    }

    const message: ChatMessage = Object.freeze({
      id: payload.id ? `msg-${payload.id}` : `msg-openai-${context.generatedAt}`,
      role: "assistant",
      content,
      createdAt: context.generatedAt,
    });

    const usage = mapUsage(payload.usage);
    const finishReason = mapFinishReason(choice?.finish_reason);
    const model: AIModel = Object.freeze({
      id: payload.model ?? context.model.id,
      name: context.model.name,
      provider: "openai",
    });

    return Object.freeze({
      message,
      model,
      usage,
      provider: "openai" as const,
      finishReason,
      generatedAt: context.generatedAt,
    });
  }
}

function mapUsage(
  usage: OpenAIChatCompletionsResponse["usage"],
): TokenUsage {
  const promptTokens = usage?.prompt_tokens ?? 0;
  const completionTokens = usage?.completion_tokens ?? 0;
  const totalTokens =
    usage?.total_tokens ?? promptTokens + completionTokens;

  return Object.freeze({
    promptTokens,
    completionTokens,
    totalTokens,
  });
}

function mapFinishReason(reason: string | null | undefined): AIFinishReason {
  switch (reason) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content_filter";
    case null:
    case undefined:
      return "unknown";
    default:
      return "unknown";
  }
}
