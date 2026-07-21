import type { AIConfiguration } from "../../../ai-config/models/AIConfiguration";
import type { HttpClient } from "../../../http/client/HttpClient";
import type { AIModel } from "../../models/AIModel";
import type { AIProviderInfo } from "../../models/AIProviderInfo";
import type { AIRequest } from "../../models/AIRequest";
import type { AIResponse } from "../../models/AIResponse";
import type { AIStreamEvent } from "../../models/AIStreamEvent";
import { AIError } from "../../models/AIError";
import { createStubStream } from "../stubHelpers";
import type { AIProvider, AIProviderStreamOptions } from "../AIProvider";
import { OpenAIErrorMapper } from "./OpenAIErrorMapper";
import { OpenAIRequestMapper } from "./OpenAIRequestMapper";
import { OpenAIResponseMapper } from "./OpenAIResponseMapper";
import { OpenAIStreamMapper } from "./OpenAIStreamMapper";
import {
  OPENAI_API_BASE_URL,
  type OpenAIChatCompletionsRequest,
  type OpenAIChatCompletionsResponse,
} from "./OpenAITypes";

/**
 * Real OpenAI Chat Completions provider (REST only — no SDK).
 *
 * Receives HttpClient + AIConfiguration via constructor DI.
 * Never calls fetch() directly.
 *
 * Streaming architecture: streamResponse prepares a stream:true payload and
 * maps vendor SSE chunks through OpenAIStreamMapper. Until HttpClient exposes
 * a dedicated byte/SSE transport, the provider synthesizes a compatible event
 * stream from the completed non-streaming response so the AIService contract
 * remains provider-agnostic.
 */
export class OpenAIProvider implements AIProvider {
  private readonly httpClient: HttpClient;
  private readonly configuration: AIConfiguration;

  constructor(httpClient: HttpClient, configuration: AIConfiguration) {
    this.httpClient = httpClient;
    this.configuration = configuration;
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const apiKey = this.requireApiKey();
    const model = this.resolveModel(request);
    const generatedAt = new Date().toISOString();

    const payload = OpenAIRequestMapper.map(request, {
      model: model.id,
      maxOutputTokens: this.configuration.tokens.maxOutputTokens,
      stream: false,
    });

    try {
      const response = await this.httpClient.request<OpenAIChatCompletionsResponse>(
        {
          url: `${OPENAI_API_BASE_URL}/chat/completions`,
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: payload,
          timeoutMs: this.configuration.timeout.timeoutMs,
          retry: {
            maxRetries: this.configuration.retry.maxRetries,
          },
        },
      );

      return OpenAIResponseMapper.map(response.body, {
        model,
        generatedAt,
      });
    } catch (error) {
      throw OpenAIErrorMapper.map(error);
    }
  }

  /**
   * Stream assistant tokens as AIStreamEvent values.
   *
   * Builds the streaming request payload (architecture) and emits a compatible
   * async iterable. Real SSE transport can replace the synthesis path later
   * without changing AIService or ConversationService.
   */
  async *streamResponse(
    request: AIRequest,
    options: AIProviderStreamOptions = {},
  ): AsyncIterable<AIStreamEvent> {
    const model = this.resolveModel(request);
    const streamingPayload = this.buildStreamingPayload(request, model);
    const sessionId = `stream-openai-${model.id}`;

    // Architecture seam: streamingPayload is ready for a future HttpClient SSE
    // transport. Keep the reference so the stream path stays intentional.
    void streamingPayload;

    try {
      if (options.signal?.aborted) {
        yield Object.freeze({
          type: "status" as const,
          sessionId,
          status: "cancelled" as const,
        });
        return;
      }

      // Compatible event stream until SSE transport lands on HttpClient.
      // Payload above remains stream:true for the future wire-up.
      const response = await this.generateResponse(request);

      yield* createStubStream(
        {
          type: "openai",
          name: "OpenAI",
          model: response.model,
          sampleContent: response.message.content,
        },
        {
          ...request,
          promptGeneratedAt: response.message.createdAt || response.generatedAt,
        },
        {
          signal: options.signal,
          delayMs: 0,
        },
      );
    } catch (error) {
      throw OpenAIErrorMapper.map(error);
    }
  }

  /**
   * Lightweight health check — validates auth against a specific model.
   * Avoids chat completion cost.
   */
  async healthCheck(): Promise<boolean> {
    const apiKey = this.configuration.provider.apiKey;
    if (!apiKey) {
      return false;
    }

    const modelId = this.configuration.model.id;

    try {
      await this.httpClient.request({
        url: `${OPENAI_API_BASE_URL}/models/${encodeURIComponent(modelId)}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        timeoutMs: Math.min(this.configuration.timeout.timeoutMs, 5_000),
        retry: { maxRetries: 0 },
      });
      return true;
    } catch {
      return false;
    }
  }

  getProviderInfo(): AIProviderInfo {
    const model = this.resolveModel();
    return Object.freeze({
      type: "openai",
      name: "OpenAI",
      model,
    });
  }

  /**
   * Map vendor SSE lines into AIStreamEvents.
   *
   * Exposed for architecture/tests — production transport will feed lines here.
   */
  static mapSseLines(
    lines: readonly string[],
    context: {
      readonly sessionId: string;
      readonly messageId: string;
      readonly createdAt: string;
      readonly fallbackUsage: {
        readonly promptTokens: number;
        readonly completionTokens: number;
        readonly totalTokens: number;
      };
    },
  ): AIStreamEvent[] {
    const events: AIStreamEvent[] = [];
    let chunkIndex = 0;
    let finishReason = OpenAIStreamMapper.mapFinishReason(undefined);
    let usage = context.fallbackUsage;

    events.push(
      Object.freeze({
        type: "start" as const,
        sessionId: context.sessionId,
        messageId: context.messageId,
        createdAt: context.createdAt,
      }),
    );
    events.push(
      Object.freeze({
        type: "status" as const,
        sessionId: context.sessionId,
        status: "streaming" as const,
      }),
    );

    for (const line of lines) {
      const parsed = OpenAIStreamMapper.parseSseDataLine(line);
      if (parsed === null) {
        continue;
      }
      if (parsed === "done") {
        break;
      }

      const deltaEvent = OpenAIStreamMapper.mapDelta(parsed, {
        sessionId: context.sessionId,
        messageId: context.messageId,
        createdAt: context.createdAt,
        chunkIndex,
      });
      if (deltaEvent) {
        events.push(deltaEvent);
        chunkIndex += 1;
      }

      const reason = parsed.choices?.[0]?.finish_reason;
      if (reason) {
        finishReason = OpenAIStreamMapper.mapFinishReason(reason);
      }
      usage = OpenAIStreamMapper.mapUsage(parsed.usage, usage);
    }

    events.push(
      Object.freeze({
        type: "done" as const,
        sessionId: context.sessionId,
        finishReason,
        usage: Object.freeze(usage),
        createdAt: context.createdAt,
      }),
    );
    events.push(
      Object.freeze({
        type: "status" as const,
        sessionId: context.sessionId,
        status: "completed" as const,
      }),
    );

    return events;
  }

  private buildStreamingPayload(
    request: AIRequest,
    model: AIModel,
  ): OpenAIChatCompletionsRequest {
    return OpenAIRequestMapper.map(request, {
      model: model.id,
      maxOutputTokens: this.configuration.tokens.maxOutputTokens,
      stream: true,
    });
  }

  private requireApiKey(): string {
    const apiKey = this.configuration.provider.apiKey;
    if (!apiKey) {
      throw new AIError(
        "authentication_failed",
        "OpenAI API key is missing",
        "openai",
      );
    }
    return apiKey;
  }

  private resolveModel(request?: AIRequest): AIModel {
    const id = request?.model?.id ?? this.configuration.model.id;
    return Object.freeze({
      id,
      name: id,
      provider: "openai",
    });
  }
}
