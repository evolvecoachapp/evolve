import { AIResponseBuilder } from "../../ai-provider/builders/AIResponseBuilder";
import { AIFinishReasons } from "../../ai-provider/models/AIFinishReason";
import type { AIFinishReason } from "../../ai-provider/models/AIFinishReason";
import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { OpenAIResponse } from "../models/OpenAIResponse";
import { OpenAIUsageMapper } from "./OpenAIUsageMapper";

export interface OpenAIResponseMapperContext {
  readonly requestId: string;
  readonly createdAt?: string;
}

/**
 * Maps OpenAIResponse → standardized immutable AIResponse.
 *
 * No business logic.
 */
export class OpenAIResponseMapper {
  static map(
    openAIResponse: OpenAIResponse,
    context: OpenAIResponseMapperContext,
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
      .withUsage(OpenAIUsageMapper.toTokenUsage(openAIResponse.usage))
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

/** @deprecated Prefer {@link OpenAIResponseMapper} */
export const ResponseMapper = OpenAIResponseMapper;

/** @deprecated Prefer {@link OpenAIResponseMapperContext} */
export type ResponseMapperContext = OpenAIResponseMapperContext;

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
