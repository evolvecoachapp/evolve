import type { AIConfiguration } from "../models/AIConfiguration";
import type {
  ConfigurationValidationIssue,
  ConfigurationValidationResult,
} from "../models/ConfigurationValidationResult";
import { validateModel } from "./validateModel";
import { validateProvider } from "./validateProvider";
import { validateRetries } from "./validateRetries";
import { validateTimeout } from "./validateTimeout";
import { validateTokens } from "./validateTokens";

/**
 * Validate a complete AIConfiguration.
 *
 * Returns a structured result; never throws for validation failures.
 */
export function validateConfiguration(
  configuration: AIConfiguration,
): ConfigurationValidationResult {
  const issues: ConfigurationValidationIssue[] = [
    ...validateProvider(configuration.provider),
    ...validateModel(configuration.model),
    ...validateTimeout(configuration.timeout),
    ...validateRetries(configuration.retry),
    ...validateTokens(configuration.tokens),
  ];

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
