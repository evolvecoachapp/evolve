import type { IAIHealthProvider } from "../../ai-provider/contracts/IAIHealthProvider";
import type { IAIModelProvider } from "../../ai-provider/contracts/IAIModelProvider";
import type { IAIProvider } from "../../ai-provider/contracts/IAIProvider";
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
import type { AIResponse } from "../../ai-provider/models/AIResponse";
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
import { ErrorMapper } from "../mappers/ErrorMapper";
import { PromptPackageMapper } from "../mappers/PromptPackageMapper";
import { ResponseMapper } from "../mappers/ResponseMapper";
import type { OpenAIExecutionResult } from "../models/OpenAIExecutionResult";
import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";
import { freezeExecutionResult } from "../utils/freezeObjects";
import { loadOpenAIConfiguration } from "../utils/loadConfiguration";
import { modelNamesEqual, normalizeModelName } from "../utils/normalizeModelName";
import { hasApiKey, validateApiKey } from "../validators/validateApiKey";
import { validateConfiguration } from "../validators/validateConfiguration";
import { validateOpenAIExecutionOptions } from "../validators/validateExecutionOptions";
import { validateMappedRequest } from "../validators/validateMappedRequest";
import { validateModelAvailability } from "../validators/validateModelAvailability";

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
 * execute() / health() / listModels() live on this adapter.
 * No streaming. No memory. No tool calling. No conversation history.
 */
export class OpenAIProvider
  implements IAIProvider, IAIHealthProvider, IAIModelProvider
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
      streaming: false,
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
        streaming: false,
      }),
    });
  }

  getStatus(): AIProviderStatus {
    return this.status;
  }

  supports(capability: AIProviderCapabilityKey): boolean {
    return this.getCapabilities()[capability];
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

  /**
   * Live health check — verifies API key presence and optional listModels probe.
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

    const hardIssues = [
      ...validateApiKey(this.configuration),
      ...validateConfiguration(this.configuration),
      ...validateOpenAIExecutionOptions(executionOptions),
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

    const openAIRequest = PromptPackageMapper.map(options.promptPackage, {
      modelId,
      options: executionOptions,
      configuration: this.configuration,
    });

    const mappedIssues = validateMappedRequest(openAIRequest);
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
      const response = ResponseMapper.map(openAIResponse, {
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
      throw ErrorMapper.toProviderError(error);
    }
  }
}

export function createOpenAIProvider(
  options: OpenAIProviderOptions = {},
): OpenAIProvider {
  return new OpenAIProvider(options);
}
