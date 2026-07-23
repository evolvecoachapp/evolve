import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import type { AIModelInfo } from "../../ai-provider/models/AIModelInfo";
import type { AIProviderHealth } from "../../ai-provider/models/AIProviderHealth";
import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { OpenAIChatTransport } from "../client/OpenAIClient";
import type { OpenAIExecutionResult } from "../models/OpenAIExecutionResult";
import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";
import {
  createOpenAIProvider,
  OpenAIProvider,
} from "../provider/OpenAIProvider";
import { loadOpenAIConfiguration } from "../utils/loadConfiguration";

/**
 * Service facade over OpenAIProvider.
 * Hides client / mapper internals from application consumers.
 */
export class OpenAIProviderService {
  private readonly provider: OpenAIProvider;

  constructor(provider?: OpenAIProvider) {
    this.provider = provider ?? createOpenAIProvider();
  }

  getProvider(): OpenAIProvider {
    return this.provider;
  }

  async executePrompt(options: {
    readonly promptPackage: PromptPackage;
    readonly modelId?: string | null;
    readonly options?: AIExecutionOptions | null;
    readonly requestId?: string;
    readonly executedAt?: string;
  }): Promise<AIResponse> {
    return this.provider.execute(options);
  }

  async executePromptDetailed(options: {
    readonly promptPackage: PromptPackage;
    readonly modelId?: string | null;
    readonly options?: AIExecutionOptions | null;
    readonly requestId?: string;
    readonly executedAt?: string;
  }): Promise<OpenAIExecutionResult> {
    return this.provider.executeDetailed(options);
  }

  async checkHealth(): Promise<AIProviderHealth> {
    return this.provider.health();
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
