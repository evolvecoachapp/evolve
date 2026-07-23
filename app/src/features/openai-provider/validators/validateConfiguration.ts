import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";

/**
 * Validate OpenAI provider configuration shape.
 */
export function validateConfiguration(
  configuration: OpenAIProviderConfiguration | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!configuration) {
    issues.push("openai_configuration_missing");
    return issues;
  }

  if (!configuration.defaultModelId.trim()) {
    issues.push("openai_configuration_default_model_missing");
  }

  if (!configuration.models || configuration.models.length === 0) {
    issues.push("openai_configuration_models_empty");
  }

  if (configuration.client.timeoutMs <= 0) {
    issues.push("openai_configuration_timeout_invalid");
  }

  if (configuration.client.maxRetries < 0) {
    issues.push("openai_configuration_max_retries_invalid");
  }

  if (configuration.retryPolicy.maxRetries < 0) {
    issues.push("openai_configuration_retry_policy_invalid");
  }

  if (configuration.retryPolicy.initialDelayMs <= 0) {
    issues.push("openai_configuration_retry_initial_delay_invalid");
  }

  if (configuration.retryPolicy.maxDelayMs <= 0) {
    issues.push("openai_configuration_retry_max_delay_invalid");
  }

  if (
    configuration.defaultTemperature != null &&
    (configuration.defaultTemperature < 0 ||
      configuration.defaultTemperature > 2)
  ) {
    issues.push("openai_configuration_temperature_out_of_range");
  }

  if (
    configuration.defaultTopP != null &&
    (configuration.defaultTopP < 0 || configuration.defaultTopP > 1)
  ) {
    issues.push("openai_configuration_top_p_out_of_range");
  }

  return issues;
}
