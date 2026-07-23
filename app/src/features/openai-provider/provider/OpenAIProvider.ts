import type { IAIHealthProvider } from "../../ai-provider/contracts/IAIHealthProvider";
import type { IAIModelProvider } from "../../ai-provider/contracts/IAIModelProvider";
import type { IAIProvider } from "../../ai-provider/contracts/IAIProvider";
import type { IAIStreamingProvider } from "../../ai-provider/contracts/IAIStreamingProvider";
import type { AIExecutionContext } from "../../ai-provider/models/AIExecutionContext";
import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import { DEFAULT_EXECUTION_OPTIONS } from "../../ai-provider/models/AIExecutionOptions";
import type { AIModelInfo } from "../../ai-provider/models/AIModelInfo";
import type { AIProvider } from "../../ai-provider/models/AIProvider";
import type { AIProviderCapabilities } from "../../ai-provider/models/AIProviderCapabilities";
import type { AIProviderCapabilityKey } from "../../ai-provider/models/AIProviderCapabilities";
import type { AIProviderConfiguration } from "../../ai-provider/models/AIProviderConfiguration";
import { AIProviderError } from "../../ai-provider/models/AIProviderError";
import type { AIProviderHealth } from "../../ai-provider/models/AIProviderHealth";
import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import type { AIProviderMetadata } from "../../ai-provider/models/AIProviderMetadata";
import { EMPTY_PROVIDER_METADATA } from "../../ai-provider/models/AIProviderMetadata";
import type { AIProviderStatus } from "../../ai-provider/models/AIProviderStatus";
import { AIProviderStatuses } from "../../ai-provider/models/AIProviderStatus";
import type { AIRequest } from "../../ai-provider/models/AIRequest";
import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { AIResponseChunk } from "../../ai-provider/models/AIResponseChunk";
import type { AIStreamingChunk } from "../../ai-provider/models/AIStreamingChunk";
import {
  freezeCapabilities,
  freezeConfiguration,
  freezeHealth,
  freezeModelInfo,
  freezeProvider,
} from "../../ai-provider/utils/freezeObjects";
import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { OpenAIChatTransport } from "../client/OpenAIClient";
import { OpenAIClient } from "../client/OpenAIClient";
import { loadOpenAIConfiguration } from "../configuration/loadOpenAIConfiguration";
import { InvalidResponseError } from "../errors";
import { OpenAIErrorMapper } from "../mappers/OpenAIErrorMapper";
import { OpenAIRequestBuilder } from "../builders/OpenAIRequestBuilder";
import { OpenAIResponseMapper } from "../mappers/OpenAIResponseMapper";
import type { OpenAIExecutionResult } from "../models/OpenAIExecutionResult";
import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";
import { OpenAIStreamingSession } from "../streaming";
import { freezeExecutionResult } from "../utils/freezeObjects";
import { modelNamesEqual, normalizeModelName } from "../utils/normalizeModelName";
import { hasApiKey, validateApiKey } from "../validators/validateApiKey";
import { validateConfiguration } from "../validators/validateConfiguration";
import { validateOpenAIExecutionOptions } from "../validators/validateExecutionOptions";
import { validateMappedRequest } from "../validators/validateMappedRequest";
import { validateModelAvailability } from "../validators/validateModelAvailability";
import { validateResponse } from "../validators/validateResponse";
import { validateStreamingEnabled } from "../validators/validateStreaming";

export interface OpenAIProviderOptions {
  readonly configuration?: OpenAIProviderConfiguration;
  readonly client?: OpenAIChatTransport;
  readonly registeredAt?: string;
}

export interface OpenAIExecuteOptions {
  readonly promptPackage: PromptPackage;
  readonly modelId?: string | null;
  readonly options?: AIExecutionOptions | null;
  readonly requestId?: string;
  readonly executedAt?: string;
}

/**
 * Concrete OpenAI provider implementing AI Provider Abstraction contracts.
 *
 * OpenAI SDK knowledge stays in OpenAIClient only.
 * No business logic. No prompt generation. No conversation orchestration. No UI.
 */
export class OpenAIProvider
  implements
    IAIProvider,
    IAIHealthProvider,
    IAIModelProvider,
    IAIStreamingProvider
{
  readonly id = AIProviderIds.OPENAI;

  private readonly configuration: OpenAIProviderConfiguration;
  private readonly client: OpenAIChatTransport;
  private readonly registeredAt: string;
  private status: AIProviderStatus;
  private lastHealth: AIProviderHealth;

  constructor(options: OpenAIProviderOptions = {}) {
    this.configuration =
      options.configuration ?? loadOpenAIConfiguration();
    this.client =
      options.client ?? new OpenAIClient(this.configuration.client);
    this.registeredAt = options.registeredAt ?? new Date().toISOString();
    this.status = hasApiKey(this.configuration)
      ? AIProviderStatuses.AVAILABLE
      : AIProviderStatuses.UNAVAILABLE;
    this.lastHealth = freezeHealth({
      providerId: this.id,
      status: this.status,
      healthy: this.status === AIProviderStatuses.AVAILABLE,
      checkedAt: null,
      message: hasApiKey(this.configuration)
        ? "configured"
        : "openai_api_key_missing",
      details: Object.freeze({
        defaultModelId: this.configuration.defaultModelId,
        streaming: this.configuration.streaming,
      }),
    });
  }

  getInfo(): AIProvider {
    return freezeProvider({
      id: this.id,
      displayName: "OpenAI",
      status: this.status,
      capabilities: this.getCapabilities(),
      configuration: this.getConfiguration(),
      health: this.lastHealth,
      models: this.listModels(),
      metadata: this.getMetadata(),
      registeredAt: this.registeredAt,
    });
  }

  getCapabilities(): AIProviderCapabilities {
    return freezeCapabilities({
      chat: true,
      streaming: this.configuration.streaming,
      tools: false,
      vision: false,
      audio: false,
      embeddings: false,
      models: true,
      health: true,
    });
  }

  getConfiguration(): AIProviderConfiguration {
    return freezeConfiguration({
      providerId: this.id,
      displayName: "OpenAI",
      enabled: this.configuration.enabled && hasApiKey(this.configuration),
      defaultModelId: this.configuration.defaultModelId,
      preferredModelIds: Object.freeze(
        this.configuration.models
          .filter((model) => model.available)
          .map((model) => model.modelId),
      ),
      limits: Object.freeze({
        maxInputTokens: null,
        maxOutputTokens:
          this.configuration.defaultMaxOutputTokens ??
          this.configuration.models[0]?.maxOutputTokens ??
          null,
        maxRequestsPerMinute: null,
        maxConcurrentRequests: null,
        maxContextWindow: this.configuration.models[0]?.contextWindow ?? null,
      }),
      metadata: EMPTY_PROVIDER_METADATA,
    });
  }

  getMetadata(): AIProviderMetadata {
    return Object.freeze({
      tags: Object.freeze(["openai", "chat"]),
      attributes: Object.freeze({
        defaultModelId: this.configuration.defaultModelId,
        streaming: this.configuration.streaming,
        organization: this.configuration.client.organization,
        project: this.configuration.client.project,
      }),
    });
  }

  getStatus(): AIProviderStatus {
    return this.status;
  }

  supports(capability: AIProviderCapabilityKey): boolean {
    return this.getCapabilities()[capability];
  }

  supportsStreaming(): boolean {
    return this.configuration.streaming;
  }

  getHealth(): AIProviderHealth {
    return this.lastHealth;
  }

  listModels(): readonly AIModelInfo[] {
    return Object.freeze(
      this.configuration.models.map((model) =>
        freezeModelInfo({
          id: model.modelId,
          providerId: this.id,
          displayName: model.displayName,
          family: model.family,
          version: null,
          capabilities: this.getCapabilities(),
          limits: Object.freeze({
            maxInputTokens: model.contextWindow,
            maxOutputTokens: model.maxOutputTokens,
            maxRequestsPerMinute: null,
            maxConcurrentRequests: null,
            maxContextWindow: model.contextWindow,
          }),
          metadata: EMPTY_PROVIDER_METADATA,
          available: model.available,
        }),
      ),
    );
  }

  getModel(modelId: string): AIModelInfo | null {
    const normalized = normalizeModelName(modelId);
    return (
      this.listModels().find((model) => modelNamesEqual(model.id, normalized)) ??
      null
    );
  }

  getProviderConfiguration(): OpenAIProviderConfiguration {
    return this.configuration;
  }

  /**
   * Live health check — verifies API key presence and configuration.
   */
  async health(): Promise<AIProviderHealth> {
    const checkedAt = new Date().toISOString();
    const apiKeyIssues = validateApiKey(this.configuration);
    const configIssues = validateConfiguration(this.configuration);

    if (apiKeyIssues.length > 0 || configIssues.length > 0) {
      this.status = AIProviderStatuses.UNAVAILABLE;
      this.lastHealth = freezeHealth({
        providerId: this.id,
        status: this.status,
        healthy: false,
        checkedAt,
        message: [...apiKeyIssues, ...configIssues].join(","),
        details: Object.freeze({
          modelCount: this.configuration.models.length,
        }),
      });
      return this.lastHealth;
    }

    this.status = AIProviderStatuses.AVAILABLE;
    this.lastHealth = freezeHealth({
      providerId: this.id,
      status: this.status,
      healthy: true,
      checkedAt,
      message: "healthy",
      details: Object.freeze({
        defaultModelId: this.configuration.defaultModelId,
        modelCount: this.listModels().length,
        streaming: this.configuration.streaming,
      }),
    });
    return this.lastHealth;
  }

  /**
   * Execute PromptPackage against OpenAI and return standardized AIResponse.
   */
  async execute(options: OpenAIExecuteOptions): Promise<AIResponse> {
    const result = await this.executeDetailed(options);
    return result.response;
  }

  async executeDetailed(
    options: OpenAIExecuteOptions,
  ): Promise<OpenAIExecutionResult> {
    const executedAt = options.executedAt ?? new Date().toISOString();
    const requestId =
      options.requestId ?? `openai-req-${executedAt}`;
    const executionOptions = options.options ?? DEFAULT_EXECUTION_OPTIONS;
    const streamingEnabled = this.configuration.streaming;

    const hardIssues = [
      ...validateApiKey(this.configuration),
      ...validateConfiguration(this.configuration),
      ...validateOpenAIExecutionOptions(executionOptions, streamingEnabled),
    ];

    const modelId =
      normalizeModelName(options.modelId) ||
      this.configuration.defaultModelId;
    hardIssues.push(
      ...validateModelAvailability(modelId, this.configuration),
    );

    if (hardIssues.length > 0) {
      throw new AIProviderError(
        hardIssues[0]!,
        `OpenAI provider validation failed: ${hardIssues.join(", ")}`,
        this.id,
      );
    }

    const openAIRequest = OpenAIRequestBuilder.fromPromptPackage(
      options.promptPackage,
      {
        modelId,
        options: executionOptions,
        configuration: this.configuration,
        stream: false,
      },
    );

    const mappedIssues = validateMappedRequest(
      openAIRequest,
      streamingEnabled,
    );
    if (mappedIssues.length > 0) {
      throw new AIProviderError(
        mappedIssues[0]!,
        `OpenAI mapped request invalid: ${mappedIssues.join(", ")}`,
        this.id,
      );
    }

    try {
      const openAIResponse = await this.client.createChatCompletion(
        openAIRequest,
      );
      const responseIssues = validateResponse(openAIResponse);
      if (responseIssues.length > 0) {
        throw new InvalidResponseError(
          `OpenAI response invalid: ${responseIssues.join(", ")}`,
          { details: Object.freeze({ issues: responseIssues.join(",") }) },
        );
      }

      const response = OpenAIResponseMapper.map(openAIResponse, {
        requestId,
        createdAt: executedAt,
      });

      return freezeExecutionResult({
        requestId,
        promptPackageId: options.promptPackage.id,
        modelId,
        openAIRequest,
        openAIResponse,
        response,
        executedAt,
      });
    } catch (error) {
      throw OpenAIErrorMapper.toProviderError(error);
    }
  }

  /**
   * Execute PromptPackage with streaming abstraction → AIStreamingChunk.
   */
  async *executeStreaming(
    options: OpenAIExecuteOptions,
  ): AsyncIterable<AIStreamingChunk> {
    const streamingIssues = validateStreamingEnabled(
      this.configuration.streaming,
    );
    if (streamingIssues.length > 0) {
      throw new AIProviderError(
        streamingIssues[0]!,
        "OpenAI streaming is not enabled in configuration",
        this.id,
      );
    }

    const executedAt = options.executedAt ?? new Date().toISOString();
    const requestId =
      options.requestId ?? `openai-stream-${executedAt}`;
    const executionOptions: AIExecutionOptions = {
      ...(options.options ?? DEFAULT_EXECUTION_OPTIONS),
      stream: true,
    };

    const hardIssues = [
      ...validateApiKey(this.configuration),
      ...validateConfiguration(this.configuration),
      ...validateOpenAIExecutionOptions(executionOptions, true),
    ];

    const modelId =
      normalizeModelName(options.modelId) ||
      this.configuration.defaultModelId;
    hardIssues.push(
      ...validateModelAvailability(modelId, this.configuration),
    );

    if (hardIssues.length > 0) {
      throw new AIProviderError(
        hardIssues[0]!,
        `OpenAI streaming validation failed: ${hardIssues.join(", ")}`,
        this.id,
      );
    }

    const openAIRequest = OpenAIRequestBuilder.fromPromptPackage(
      options.promptPackage,
      {
        modelId,
        options: executionOptions,
        configuration: this.configuration,
        stream: true,
      },
    );

    const mappedIssues = validateMappedRequest(openAIRequest, true);
    if (mappedIssues.length > 0) {
      throw new AIProviderError(
        mappedIssues[0]!,
        `OpenAI mapped stream request invalid: ${mappedIssues.join(", ")}`,
        this.id,
      );
    }

    const streamSource =
      this.client.createChatCompletionStream != null
        ? this.client
        : this.client instanceof OpenAIClient
          ? this.client
          : null;

    if (!streamSource?.createChatCompletionStream) {
      throw new AIProviderError(
        "openai_streaming_transport_missing",
        "OpenAI streaming transport is not available",
        this.id,
      );
    }

    const session = new OpenAIStreamingSession({
      source: {
        createChatCompletionStream: (request) =>
          streamSource.createChatCompletionStream!(request),
      },
      requestId,
      createdAt: executedAt,
    });

    try {
      yield* session.stream(openAIRequest);
    } catch (error) {
      throw OpenAIErrorMapper.toProviderError(error);
    }
  }

  /**
   * IAIStreamingProvider.stream — AIRequest path for abstraction compatibility.
   */
  async *stream(
    request: AIRequest,
    _context: AIExecutionContext,
  ): AsyncIterable<AIResponseChunk> {
    if (!this.supportsStreaming()) {
      throw new AIProviderError(
        "openai_streaming_not_enabled",
        "OpenAI streaming is not enabled in configuration",
        this.id,
      );
    }

    for await (const chunk of this.executeStreaming({
      promptPackage: request.promptPackage,
      modelId: request.model?.id ?? null,
      options: request.options,
      requestId: request.id,
    })) {
      yield Object.freeze({
        id: chunk.id,
        requestId: request.id,
        providerId: this.id,
        index: chunk.index,
        delta: chunk.delta,
        finishReason: chunk.finishReason,
        usage: chunk.usage,
        createdAt: chunk.createdAt,
      });
    }
  }
}

export function createOpenAIProvider(
  options: OpenAIProviderOptions = {},
): OpenAIProvider {
  return new OpenAIProvider(options);
}
