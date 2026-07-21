import type { AIProviderType } from "../../ai/models/AIProviderType";
import { AI_CONFIGURATION_DEFAULTS } from "../environment/defaults";
import type { LoadedEnvironment } from "../environment/EnvironmentLoader";
import type { AIConfiguration } from "../models/AIConfiguration";
import type { EnvironmentConfiguration } from "../models/EnvironmentConfiguration";
import { deepFreezeConfiguration } from "../utils/deepFreezeConfiguration";

/** Optional future user overrides merged last. */
export interface AIConfigurationOverrides {
  readonly providerType?: AIProviderType;
  readonly modelId?: string;
  readonly timeoutMs?: number;
  readonly maxRetries?: number;
  readonly maxOutputTokens?: number;
  readonly apiKey?: string | null;
}

export interface AIConfigurationFactoryInput {
  readonly environment: LoadedEnvironment;
  readonly overrides?: AIConfigurationOverrides;
}

/**
 * Builds a complete immutable AIConfiguration.
 *
 * Merge order: defaults → environment → user overrides (future).
 */
export class AIConfigurationFactory {
  static create(input: AIConfigurationFactoryInput): AIConfiguration {
    const { environment, overrides = {} } = input;

    const providerType = resolveProviderType(
      overrides.providerType ?? environment.provider,
    );

    const modelId =
      overrides.modelId ??
      environment.model ??
      AI_CONFIGURATION_DEFAULTS.model;

    const timeoutMs =
      overrides.timeoutMs ??
      environment.timeoutMs ??
      AI_CONFIGURATION_DEFAULTS.timeoutMs;

    const maxRetries =
      overrides.maxRetries ??
      environment.maxRetries ??
      AI_CONFIGURATION_DEFAULTS.maxRetries;

    const maxOutputTokens =
      overrides.maxOutputTokens ??
      environment.maxOutputTokens ??
      AI_CONFIGURATION_DEFAULTS.maxOutputTokens;

    const apiKey =
      overrides.apiKey !== undefined
        ? overrides.apiKey
        : selectApiKey(providerType, environment);

    const environmentView: EnvironmentConfiguration = Object.freeze({
      provider: environment.providerFromEnv ? environment.provider : null,
      model: environment.modelFromEnv ? environment.model : null,
      timeoutMs: environment.timeoutFromEnv ? environment.timeoutMs : null,
      maxRetries: environment.maxRetriesFromEnv
        ? environment.maxRetries
        : null,
      maxOutputTokens: environment.maxOutputTokensFromEnv
        ? environment.maxOutputTokens
        : null,
      hasOpenAIApiKey: environment.openAIApiKey != null,
      hasAnthropicApiKey: environment.anthropicApiKey != null,
      hasGeminiApiKey: environment.geminiApiKey != null,
    });

    const configuration: AIConfiguration = {
      provider: {
        type: providerType,
        apiKey,
      },
      model: {
        id: modelId,
      },
      tokens: {
        maxOutputTokens,
      },
      retry: {
        maxRetries,
      },
      timeout: {
        timeoutMs,
      },
      environment: environmentView,
    };

    return deepFreezeConfiguration(configuration);
  }

  /** Build from defaults only — useful for tests and local stubs. */
  static createDefault(
    overrides: AIConfigurationOverrides = {},
  ): AIConfiguration {
    const environment: LoadedEnvironment = Object.freeze({
      provider: AI_CONFIGURATION_DEFAULTS.provider,
      model: AI_CONFIGURATION_DEFAULTS.model,
      timeoutMs: AI_CONFIGURATION_DEFAULTS.timeoutMs,
      maxRetries: AI_CONFIGURATION_DEFAULTS.maxRetries,
      maxOutputTokens: AI_CONFIGURATION_DEFAULTS.maxOutputTokens,
      openAIApiKey: null,
      anthropicApiKey: null,
      geminiApiKey: null,
      providerFromEnv: false,
      modelFromEnv: false,
      timeoutFromEnv: false,
      maxRetriesFromEnv: false,
      maxOutputTokensFromEnv: false,
    });

    return AIConfigurationFactory.create({ environment, overrides });
  }
}

function resolveProviderType(value: string): AIProviderType {
  // Preserve normalized env value so validators can report unsupported_provider.
  return value.trim().toLowerCase() as AIProviderType;
}

function selectApiKey(
  providerType: AIProviderType,
  environment: LoadedEnvironment,
): string | null {
  switch (providerType) {
    case "openai":
      return environment.openAIApiKey;
    case "anthropic":
      return environment.anthropicApiKey;
    case "gemini":
      return environment.geminiApiKey;
    case "local":
      return null;
    default:
      return null;
  }
}
