import OpenAI from "openai";
import type { ChatCompletion } from "openai/resources/chat/completions";
import { OpenAIResponseBuilder } from "../builders/OpenAIResponseBuilder";
import { OpenAIErrorMapper } from "../mappers/OpenAIErrorMapper";
import { OpenAIUsageMapper } from "../mappers/OpenAIUsageMapper";
import type { OpenAIClientOptions } from "../models/OpenAIClientOptions";
import type { OpenAIRequest } from "../models/OpenAIRequest";
import type { OpenAIResponse } from "../models/OpenAIResponse";
import type { OpenAIStreamChunk } from "../models/OpenAIStreamChunk";
import { ZERO_OPENAI_USAGE } from "../models/OpenAIUsage";
import type { OpenAIStreamSource } from "../streaming/OpenAIStreamingSession";
import { freezeResponseOpenAI } from "../utils/freezeObjects";

/**
 * Transport seam for OpenAI Chat Completions (sync + streaming).
 *
 * Tests inject a mock; production uses the official OpenAI SDK.
 * SDK objects never leave this class.
 */
export type OpenAIChatTransport = {
  createChatCompletion(request: OpenAIRequest): Promise<OpenAIResponse>;
  createChatCompletionStream?(
    request: OpenAIRequest,
  ): AsyncIterable<OpenAIStreamChunk>;
};

/**
 * OpenAIClient — SDK communication only.
 *
 * No mapping orchestration beyond SDK → provider-layer shapes.
 * SDK types never leave this class.
 */
export class OpenAIClient implements OpenAIChatTransport, OpenAIStreamSource {
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
      throw OpenAIErrorMapper.toOpenAIProviderError(error);
    }
  }

  async *createChatCompletionStream(
    request: OpenAIRequest,
  ): AsyncIterable<OpenAIStreamChunk> {
    if (this.transport?.createChatCompletionStream) {
      yield* this.transport.createChatCompletionStream(request);
      return;
    }

    try {
      const client = this.getSdk();
      const stream = await client.chat.completions.create(
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
          stream: true,
          stream_options: { include_usage: true },
        },
        {
          timeout: request.timeoutMs ?? this.options.timeoutMs,
        },
      );

      let index = 0;
      for await (const part of stream) {
        const choice = part.choices?.[0];
        const delta = choice?.delta?.content ?? "";
        const finishReason = choice?.finish_reason ?? null;
        const createdAt = part.created
          ? new Date(part.created * 1000).toISOString()
          : new Date().toISOString();

        yield Object.freeze({
          id: part.id || `openai-stream-${createdAt}`,
          index,
          delta,
          finishReason,
          model: part.model ?? null,
          usage: part.usage
            ? OpenAIUsageMapper.fromRaw(part.usage)
            : null,
          createdAt,
        });
        index += 1;
      }
    } catch (error) {
      throw OpenAIErrorMapper.toOpenAIProviderError(error);
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
        project: this.options.project ?? undefined,
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
    ? OpenAIUsageMapper.fromRaw(completion.usage)
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
