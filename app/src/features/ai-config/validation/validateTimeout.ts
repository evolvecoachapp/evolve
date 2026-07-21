import type { ConfigurationValidationIssue } from "../models/ConfigurationValidationResult";
import type { TimeoutConfiguration } from "../models/TimeoutConfiguration";

/**
 * Validate timeout configuration.
 *
 * Returns structured issues; never throws for validation failures.
 */
export function validateTimeout(
  timeout: TimeoutConfiguration,
): readonly ConfigurationValidationIssue[] {
  const issues: ConfigurationValidationIssue[] = [];

  if (
    typeof timeout.timeoutMs !== "number" ||
    !Number.isFinite(timeout.timeoutMs) ||
    timeout.timeoutMs <= 0
  ) {
    issues.push(
      Object.freeze({
        field: "timeout.timeoutMs",
        code: "invalid_timeout",
      }),
    );
  }

  return Object.freeze(issues);
}
