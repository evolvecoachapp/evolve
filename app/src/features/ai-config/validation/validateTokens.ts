import type { ConfigurationValidationIssue } from "../models/ConfigurationValidationResult";
import type { TokenConfiguration } from "../models/TokenConfiguration";

/**
 * Validate token configuration.
 *
 * Returns structured issues; never throws for validation failures.
 */
export function validateTokens(
  tokens: TokenConfiguration,
): readonly ConfigurationValidationIssue[] {
  const issues: ConfigurationValidationIssue[] = [];

  if (
    typeof tokens.maxOutputTokens !== "number" ||
    !Number.isFinite(tokens.maxOutputTokens) ||
    !Number.isInteger(tokens.maxOutputTokens) ||
    tokens.maxOutputTokens <= 0
  ) {
    issues.push(
      Object.freeze({
        field: "tokens.maxOutputTokens",
        code: "invalid_max_output_tokens",
      }),
    );
  }

  return Object.freeze(issues);
}
