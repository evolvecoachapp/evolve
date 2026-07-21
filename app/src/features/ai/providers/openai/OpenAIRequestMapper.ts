import type { AIRequest } from "../../models/AIRequest";
import {
  OPENAI_DEFAULT_TEMPERATURE,
  type OpenAIChatCompletionsRequest,
  type OpenAIChatMessage,
} from "./OpenAITypes";

export interface OpenAIRequestMapperOptions {
  readonly model: string;
  readonly maxOutputTokens: number;
  readonly temperature?: number;
}

/**
 * Maps provider-agnostic AIRequest → OpenAI Chat Completions payload.
 *
 * Supports system / user / assistant history, temperature, max tokens, model.
 * Streaming is never enabled.
 */
export class OpenAIRequestMapper {
  static map(
    request: AIRequest,
    options: OpenAIRequestMapperOptions,
  ): OpenAIChatCompletionsRequest {
    const messages: OpenAIChatMessage[] = request.messages.map((message) =>
      Object.freeze({
        role: message.role,
        content: message.content,
      }),
    );

    return Object.freeze({
      model: options.model,
      messages: Object.freeze(messages),
      temperature: options.temperature ?? OPENAI_DEFAULT_TEMPERATURE,
      max_tokens: options.maxOutputTokens,
      stream: false as const,
    });
  }
}
