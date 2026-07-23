import { AIResponseBuilder } from "../../ai-provider/builders/AIResponseBuilder";
import { AIFinishReasons } from "../../ai-provider/models/AIFinishReason";
import type { AIFinishReason } from "../../ai-provider/models/AIFinishReason";
import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { OpenAIResponse } from "../models/OpenAIResponse";

export interface ResponseMapperContext {
  readonly requestId: string;
  readonly createdAt?: string;
}

/**
 * Maps OpenAIResponse → standardized immutable AIResponse.
 *
 * No business logic.
 */
export class ResponseMapper {
  static map(
    openAIResponse: OpenAIResponse,
    context: ResponseMapperContext,
  ): AIResponse {
    const choice = openAIResponse.choices[0];
    const content = choice?.message?.content?.trim() ?? "";
    const finishReason = mapFinishReason(
      choice?.finishReason ?? openAIResponse.rawFinishReason,
    );

    return new AIResponseBuilder()
      .withId(openAIResponse.id)
      .withRequestId(context.requestId)
      .withProviderId(AIProviderIds.OPENAI)
      .withModelId(openAIResponse.model || null)
      .withContent(content)
      .withFinishReason(finishReason)
      .withUsage(
        Object.freeze({
          promptTokens: openAIResponse.usage.promptTokens,
          completionTokens: openAIResponse.usage.completionTokens,
          totalTokens: openAIResponse.usage.totalTokens,
        }),
      )
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["openai"]),
          attributes: Object.freeze({
            rawFinishReason: openAIResponse.rawFinishReason,
            choiceCount: openAIResponse.choices.length,
          }),
        }),
      )
      .withCreatedAt(context.createdAt ?? openAIResponse.createdAt)
      .build();
  }
}

function mapFinishReason(reason: string | null | undefined): AIFinishReason {
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
    case null:
    case undefined:
    case "":
      return AIFinishReasons.UNKNOWN;
    default:
      return AIFinishReasons.UNKNOWN;
  }
}
