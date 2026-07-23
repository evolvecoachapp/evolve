import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import type { AIModelInfo } from "../../ai-provider/models/AIModelInfo";
import type { AIProviderHealth } from "../../ai-provider/models/AIProviderHealth";
import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { AIStreamingChunk } from "../../ai-provider/models/AIStreamingChunk";
import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { OpenAIChatTransport } from "../client/OpenAIClient";
import { loadOpenAIConfiguration } from "../configuration/loadOpenAIConfiguration";
import type { OpenAIExecutionResult } from "../models/OpenAIExecutionResult";
import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";
import {
  createOpenAIProvider,
  OpenAIProvider,
} from "../provider/OpenAIProvider";
import { validateConfiguration } from "../validators/validateConfiguration";
import { validateApiKey } from "../validators/validateApiKey";

/**
 * Service facade over OpenAIProvider.
 *
 * Coordinates builder / client / mapper / validator via the provider.
 * No business logic.
 */
export class OpenAIProviderService {
  private readonly provider: OpenAIProvider;

  constructor(provider?: OpenAIProvider) {
    this.provider = provider ?? createOpenAIProvider();
  }

  getProvider(): OpenAIProvider {
    return this.provider;
  }

  async execute(options: {
    readonly promptPackage: PromptPackage;
    readonly modelId?: string | null;
    readonly options?: AIExecutionOptions | null;
    readonly requestId?: string;
    readonly executedAt?: string;
  }): Promise<AIResponse> {
    return this.provider.execute(options);
  }

  /** @deprecated Prefer {@link execute} */
  async executePrompt(options: {
    readonly promptPackage: PromptPackage;
    readonly modelId?: string | null;
    readonly options?: AIExecutionOptions | null;
    readonly requestId?: string;
    readonly executedAt?: string;
  }): Promise<AIResponse> {
    return this.execute(options);
  }

  async executeDetailed(options: {
    readonly promptPackage: PromptPackage;
    readonly modelId?: string | null;
    readonly options?: AIExecutionOptions | null;
    readonly requestId?: string;
    readonly executedAt?: string;
  }): Promise<OpenAIExecutionResult> {
    return this.provider.executeDetailed(options);
  }

  /** @deprecated Prefer {@link executeDetailed} */
  async executePromptDetailed(options: {
    readonly promptPackage: PromptPackage;
    readonly modelId?: string | null;
    readonly options?: AIExecutionOptions | null;
    readonly requestId?: string;
    readonly executedAt?: string;
  }): Promise<OpenAIExecutionResult> {
    return this.executeDetailed(options);
  }

  async *executeStreaming(options: {
    readonly promptPackage: PromptPackage;
    readonly modelId?: string | null;
    readonly options?: AIExecutionOptions | null;
    readonly requestId?: string;
    readonly executedAt?: string;
  }): AsyncIterable<AIStreamingChunk> {
    yield* this.provider.executeStreaming(options);
  }

  async healthCheck(): Promise<AIProviderHealth> {
    return this.provider.health();
  }

  /** @deprecated Prefer {@link healthCheck} */
  async checkHealth(): Promise<AIProviderHealth> {
    return this.healthCheck();
  }

  validateConfiguration(): readonly string[] {
    const configuration = this.provider.getProviderConfiguration();
    return Object.freeze([
      ...validateApiKey(configuration),
      ...validateConfiguration(configuration),
    ]);
  }

  listAvailableModels(): readonly AIModelInfo[] {
    return this.provider.listModels().filter((model) => model.available);
  }
}

export function createOpenAIProviderService(options?: {
  readonly configuration?: OpenAIProviderConfiguration;
  readonly client?: OpenAIChatTransport;
  readonly provider?: OpenAIProvider;
}): OpenAIProviderService {
  if (options?.provider) {
    return new OpenAIProviderService(options.provider);
  }

  const configuration =
    options?.configuration ?? loadOpenAIConfiguration();
  const provider = createOpenAIProvider({
    configuration,
    client: options?.client,
  });
  return new OpenAIProviderService(provider);
}
