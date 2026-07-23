import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";

/**
 * Validate that an API key is present (never logs the key).
 */
export function validateApiKey(
  configuration: OpenAIProviderConfiguration | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!configuration) {
    issues.push("openai_api_key_configuration_missing");
    return issues;
  }

  if (!configuration.client.apiKey || configuration.client.apiKey.trim().length === 0) {
    issues.push("openai_api_key_missing");
  }

  return issues;
}

export function hasApiKey(
  configuration: OpenAIProviderConfiguration | null | undefined,
): boolean {
  return validateApiKey(configuration).length === 0;
}
