import type { OpenAIClientOptions } from "./OpenAIClientOptions";
import type { OpenAIModelConfiguration } from "./OpenAIModelConfiguration";

/**
 * Immutable OpenAI provider configuration loaded from environment.
 *
 * Secrets are retained for client construction only — never exported
 * through the public application API.
 */
export interface OpenAIProviderConfiguration {
  readonly enabled: boolean;
  readonly defaultModelId: string;
  readonly models: readonly OpenAIModelConfiguration[];
  readonly client: OpenAIClientOptions;
  readonly defaultTemperature: number | null;
  readonly defaultMaxOutputTokens: number | null;
}

export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
export const DEFAULT_OPENAI_TEMPERATURE = 0.7;
