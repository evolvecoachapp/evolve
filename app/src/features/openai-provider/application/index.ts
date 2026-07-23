import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import type { AIModelInfo } from "../../ai-provider/models/AIModelInfo";
import type { AIProviderHealth } from "../../ai-provider/models/AIProviderHealth";
import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { OpenAIChatTransport } from "../client/OpenAIClient";
import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";
import {
  createOpenAIProviderService,
  type OpenAIProviderService,
} from "../services/OpenAIProviderService";

function resolveService(
  service?: OpenAIProviderService,
): OpenAIProviderService {
  return service ?? createOpenAIProviderService();
}

/**
 * Public API — execute PromptPackage via OpenAI → standardized AIResponse.
 *
 * Does not expose client internals.
 */
export async function executePrompt(options: {
  readonly promptPackage: PromptPackage;
  readonly modelId?: string | null;
  readonly options?: AIExecutionOptions | null;
  readonly requestId?: string;
  readonly executedAt?: string;
  readonly service?: OpenAIProviderService;
  readonly configuration?: OpenAIProviderConfiguration;
  readonly client?: OpenAIChatTransport;
}): Promise<AIResponse> {
  const { service, configuration, client, ...rest } = options;
  const resolved =
    service ??
    createOpenAIProviderService({ configuration, client });
  return resolveService(resolved).executePrompt(rest);
}

/**
 * Public API — check OpenAI provider health.
 */
export async function checkHealth(options?: {
  readonly service?: OpenAIProviderService;
  readonly configuration?: OpenAIProviderConfiguration;
  readonly client?: OpenAIChatTransport;
}): Promise<AIProviderHealth> {
  const resolved =
    options?.service ??
    createOpenAIProviderService({
      configuration: options?.configuration,
      client: options?.client,
    });
  return resolveService(resolved).checkHealth();
}

/**
 * Public API — list available OpenAI models.
 */
export function listAvailableModels(options?: {
  readonly service?: OpenAIProviderService;
  readonly configuration?: OpenAIProviderConfiguration;
  readonly client?: OpenAIChatTransport;
}): readonly AIModelInfo[] {
  const resolved =
    options?.service ??
    createOpenAIProviderService({
      configuration: options?.configuration,
      client: options?.client,
    });
  return resolveService(resolved).listAvailableModels();
}
