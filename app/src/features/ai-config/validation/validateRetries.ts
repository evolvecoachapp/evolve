import type { ConfigurationValidationIssue } from "../models/ConfigurationValidationResult";
import type { RetryConfiguration } from "../models/RetryConfiguration";

/**
 * Validate retry configuration.
 *
 * Returns structured issues; never throws for validation failures.
 */
export function validateRetries(
  retry: RetryConfiguration,
): readonly ConfigurationValidationIssue[] {
  const issues: ConfigurationValidationIssue[] = [];

  if (
    typeof retry.maxRetries !== "number" ||
    !Number.isFinite(retry.maxRetries) ||
    !Number.isInteger(retry.maxRetries) ||
    retry.maxRetries < 0
  ) {
    issues.push(
      Object.freeze({
        field: "retry.maxRetries",
        code: "invalid_retries",
      }),
    );
  }

  return Object.freeze(issues);
}
