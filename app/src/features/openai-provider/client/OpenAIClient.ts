import OpenAI from "openai";
import type { ChatCompletion } from "openai/resources/chat/completions";
import { OpenAIResponseBuilder } from "../builders/OpenAIResponseBuilder";
import { ErrorMapper } from "../mappers/ErrorMapper";
import type { OpenAIClientOptions } from "../models/OpenAIClientOptions";
import type { OpenAIRequest } from "../models/OpenAIRequest";
import type { OpenAIResponse } from "../models/OpenAIResponse";
import { ZERO_OPENAI_USAGE } from "../models/OpenAIUsage";
import { freezeResponseOpenAI } from "../utils/freezeObjects";

/**
 * Transport seam for OpenAI Chat Completions.
 *
 * Tests inject a mock; production uses the official OpenAI SDK.
 * SDK objects never leave this class.
 */
export type OpenAIChatTransport = {
  createChatCompletion(request: OpenAIRequest): Promise<OpenAIResponse>;
};

/**
 * OpenAIClient — receives mapped request, calls OpenAI SDK, returns raw
 * provider-layer OpenAIResponse (never SDK types).
 */
export class OpenAIClient implements OpenAIChatTransport {
  private readonly options: OpenAIClientOptions;
  private readonly transport: OpenAIChatTransport | null;
  private sdk: OpenAI | null = null;

  constructor(
    options: OpenAIClientOptions,
    transport?: OpenAIChatTransport | null,
  ) {
    this.options = Object.freeze({ ...options });
    this.transport = transport ?? null;
  }

  async createChatCompletion(request: OpenAIRequest): Promise<OpenAIResponse> {
    if (this.transport) {
      return this.transport.createChatCompletion(request);
    }

    try {
      const client = this.getSdk();
      const completion = await client.chat.completions.create(
        {
          model: request.model,
          messages: request.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          temperature: request.temperature ?? undefined,
          max_tokens: request.maxTokens ?? undefined,
          top_p: request.topP ?? undefined,
          stop:
            request.stop && request.stop.length > 0
              ? [...request.stop]
              : undefined,
          stream: false,
        },
        {
          timeout: request.timeoutMs ?? this.options.timeoutMs,
        },
      );

      return mapSdkCompletion(completion);
    } catch (error) {
      throw ErrorMapper.toOpenAIProviderError(error);
    }
  }

  private getSdk(): OpenAI {
    if (!this.sdk) {
      this.sdk = new OpenAI({
        apiKey: this.options.apiKey,
        baseURL: this.options.baseURL ?? undefined,
        timeout: this.options.timeoutMs,
        maxRetries: this.options.maxRetries,
        organization: this.options.organization ?? undefined,
      });
    }
    return this.sdk;
  }
}

export function createOpenAIClient(
  options: OpenAIClientOptions,
  transport?: OpenAIChatTransport | null,
): OpenAIClient {
  return new OpenAIClient(options, transport);
}

function mapSdkCompletion(completion: ChatCompletion): OpenAIResponse {
  const createdAt = completion.created
    ? new Date(completion.created * 1000).toISOString()
    : new Date().toISOString();

  const choices = (completion.choices ?? []).map((choice, index) =>
    Object.freeze({
      index: choice.index ?? index,
      message: Object.freeze({
        role: (choice.message?.role === "assistant" ||
        choice.message?.role === "user" ||
        choice.message?.role === "system"
          ? choice.message.role
          : "assistant") as "system" | "user" | "assistant",
        content: choice.message?.content ?? "",
      }),
      finishReason: choice.finish_reason ?? null,
    }),
  );

  const usage = completion.usage
    ? Object.freeze({
        promptTokens: completion.usage.prompt_tokens ?? 0,
        completionTokens: completion.usage.completion_tokens ?? 0,
        totalTokens: completion.usage.total_tokens ?? 0,
      })
    : ZERO_OPENAI_USAGE;

  return freezeResponseOpenAI(
    new OpenAIResponseBuilder()
      .withId(completion.id || `openai-${createdAt}`)
      .withModel(completion.model || "")
      .withChoices(choices)
      .withUsage(usage)
      .withCreatedAt(createdAt)
      .withRawFinishReason(choices[0]?.finishReason ?? null)
      .build(),
  );
}
