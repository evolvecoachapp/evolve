import type { AIProviderConfiguration } from "../models/AIProviderConfiguration";
import { validateProviderId } from "./validateProviderId";

/**
 * Soft-validate provider configuration integrity.
 */
export function validateConfiguration(
  configuration: AIProviderConfiguration | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!configuration) {
    issues.push("configuration_missing");
    return issues;
  }

  issues.push(...validateProviderId(configuration.providerId));

  if (!configuration.displayName || configuration.displayName.trim().length === 0) {
    issues.push("configuration_display_name_missing");
  }

  if (!configuration.enabled) {
    issues.push("configuration_disabled");
  }

  if (
    configuration.defaultModelId &&
    configuration.preferredModelIds.length > 0 &&
    !configuration.preferredModelIds.includes(configuration.defaultModelId)
  ) {
    issues.push("configuration_default_model_not_preferred");
  }

  const limits = configuration.limits;
  if (limits.maxInputTokens != null && limits.maxInputTokens <= 0) {
    issues.push("configuration_max_input_tokens_invalid");
  }
  if (limits.maxOutputTokens != null && limits.maxOutputTokens <= 0) {
    issues.push("configuration_max_output_tokens_invalid");
  }
  if (
    limits.maxRequestsPerMinute != null &&
    limits.maxRequestsPerMinute <= 0
  ) {
    issues.push("configuration_max_rpm_invalid");
  }

  return issues;
}
