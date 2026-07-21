import type { AIConfiguration } from "../models/AIConfiguration";
import type { LoadedEnvironment } from "../environment/EnvironmentLoader";

export function createLoadedEnvironment(
  overrides: Partial<LoadedEnvironment> = {},
): LoadedEnvironment {
  return Object.freeze({
    provider: "local",
    model: "local-default",
    timeoutMs: 30_000,
    maxRetries: 2,
    maxOutputTokens: 1_024,
    openAIApiKey: null,
    anthropicApiKey: null,
    geminiApiKey: null,
    providerFromEnv: false,
    modelFromEnv: false,
    timeoutFromEnv: false,
    maxRetriesFromEnv: false,
    maxOutputTokensFromEnv: false,
    ...overrides,
  });
}

export function createAIConfiguration(
  overrides: Partial<{
    providerType: AIConfiguration["provider"]["type"];
    apiKey: string | null;
    modelId: string;
    timeoutMs: number;
    maxRetries: number;
    maxOutputTokens: number;
  }> = {},
): AIConfiguration {
  return Object.freeze({
    provider: Object.freeze({
      type: overrides.providerType ?? "local",
      apiKey: overrides.apiKey ?? null,
    }),
    model: Object.freeze({
      id: overrides.modelId ?? "local-default",
    }),
    tokens: Object.freeze({
      maxOutputTokens: overrides.maxOutputTokens ?? 1_024,
    }),
    retry: Object.freeze({
      maxRetries: overrides.maxRetries ?? 2,
    }),
    timeout: Object.freeze({
      timeoutMs: overrides.timeoutMs ?? 30_000,
    }),
    environment: Object.freeze({
      provider: null,
      model: null,
      timeoutMs: null,
      maxRetries: null,
      maxOutputTokens: null,
      hasOpenAIApiKey: false,
      hasAnthropicApiKey: false,
      hasGeminiApiKey: false,
    }),
  });
}
