import { AI_PROVIDER_TYPES } from "../../ai/models/AIProviderType";
import type { ConfigurationValidationIssue } from "../models/ConfigurationValidationResult";
import type { ProviderConfiguration } from "../models/ProviderConfiguration";

/**
 * Validate provider selection.
 *
 * Returns structured issues; never throws for validation failures.
 */
export function validateProvider(
  provider: ProviderConfiguration,
): readonly ConfigurationValidationIssue[] {
  const issues: ConfigurationValidationIssue[] = [];

  if (!provider.type) {
    issues.push(
      Object.freeze({
        field: "provider.type",
        code: "missing_provider",
      }),
    );
    return Object.freeze(issues);
  }

  if (!(AI_PROVIDER_TYPES as readonly string[]).includes(provider.type)) {
    issues.push(
      Object.freeze({
        field: "provider.type",
        code: "unsupported_provider",
      }),
    );
  }

  if (provider.type !== "local") {
    if (provider.apiKey == null || provider.apiKey.trim().length === 0) {
      issues.push(
        Object.freeze({
          field: "provider.apiKey",
          code: "missing_api_key",
        }),
      );
    }
  }

  return Object.freeze(issues);
}
