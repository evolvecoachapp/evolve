import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import type { AIModelInfo } from "../../ai-provider/models/AIModelInfo";
import type { AIProviderHealth } from "../../ai-provider/models/AIProviderHealth";
import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { AIStreamingChunk } from "../../ai-provider/models/AIStreamingChunk";
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

function resolveFromOptions(options?: {
  readonly service?: OpenAIProviderService;
  readonly configuration?: OpenAIProviderConfiguration;
  readonly client?: OpenAIChatTransport;
}): OpenAIProviderService {
  return (
    options?.service ??
    createOpenAIProviderService({
      configuration: options?.configuration,
      client: options?.client,
    })
  );
}

/**
 * Public API — execute PromptPackage via OpenAI → standardized AIResponse.
 *
 * Does not expose client / SDK internals.
 */
export async function execute(options: {
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
    service ?? createOpenAIProviderService({ configuration, client });
  return resolveService(resolved).execute(rest);
}

/** @deprecated Prefer {@link execute} */
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
  return execute(options);
}

/**
 * Public API — execute PromptPackage with streaming abstraction.
 */
export async function* executeStreaming(options: {
  readonly promptPackage: PromptPackage;
  readonly modelId?: string | null;
  readonly options?: AIExecutionOptions | null;
  readonly requestId?: string;
  readonly executedAt?: string;
  readonly service?: OpenAIProviderService;
  readonly configuration?: OpenAIProviderConfiguration;
  readonly client?: OpenAIChatTransport;
}): AsyncIterable<AIStreamingChunk> {
  const { service, configuration, client, ...rest } = options;
  const resolved =
    service ?? createOpenAIProviderService({ configuration, client });
  yield* resolveService(resolved).executeStreaming(rest);
}

/**
 * Public API — check OpenAI provider health.
 */
export async function healthCheck(options?: {
  readonly service?: OpenAIProviderService;
  readonly configuration?: OpenAIProviderConfiguration;
  readonly client?: OpenAIChatTransport;
}): Promise<AIProviderHealth> {
  return resolveFromOptions(options).healthCheck();
}

/** @deprecated Prefer {@link healthCheck} */
export async function checkHealth(options?: {
  readonly service?: OpenAIProviderService;
  readonly configuration?: OpenAIProviderConfiguration;
  readonly client?: OpenAIChatTransport;
}): Promise<AIProviderHealth> {
  return healthCheck(options);
}

/**
 * Public API — soft-validate OpenAI configuration.
 */
export function validateConfiguration(options?: {
  readonly service?: OpenAIProviderService;
  readonly configuration?: OpenAIProviderConfiguration;
  readonly client?: OpenAIChatTransport;
}): readonly string[] {
  return resolveFromOptions(options).validateConfiguration();
}

/**
 * Public API — list available OpenAI models.
 */
export function listAvailableModels(options?: {
  readonly service?: OpenAIProviderService;
  readonly configuration?: OpenAIProviderConfiguration;
  readonly client?: OpenAIChatTransport;
}): readonly AIModelInfo[] {
  return resolveFromOptions(options).listAvailableModels();
}
