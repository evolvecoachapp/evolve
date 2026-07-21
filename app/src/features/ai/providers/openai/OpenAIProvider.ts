import type { AIConfiguration } from "../../../ai-config/models/AIConfiguration";
import type { HttpClient } from "../../../http/client/HttpClient";
import type { AIModel } from "../../models/AIModel";
import type { AIProviderInfo } from "../../models/AIProviderInfo";
import type { AIRequest } from "../../models/AIRequest";
import type { AIResponse } from "../../models/AIResponse";
import { AIError } from "../../models/AIError";
import type { AIProvider } from "../AIProvider";
import { OpenAIErrorMapper } from "./OpenAIErrorMapper";
import { OpenAIRequestMapper } from "./OpenAIRequestMapper";
import { OpenAIResponseMapper } from "./OpenAIResponseMapper";
import {
  OPENAI_API_BASE_URL,
  type OpenAIChatCompletionsResponse,
} from "./OpenAITypes";

/**
 * Real OpenAI Chat Completions provider (REST only — no SDK).
 *
 * Receives HttpClient + AIConfiguration via constructor DI.
 * Never calls fetch() directly.
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
