import type { AIExecutionOptions } from "../models/AIExecutionOptions";

/**
 * Soft-validate execution options ranges.
 */
export function validateExecutionOptions(
  options: AIExecutionOptions | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!options) {
    issues.push("execution_options_missing");
    return issues;
  }

  if (
    options.temperature != null &&
    (options.temperature < 0 || options.temperature > 2)
  ) {
    issues.push("execution_options_temperature_out_of_range");
  }

  if (options.maxOutputTokens != null && options.maxOutputTokens <= 0) {
    issues.push("execution_options_max_output_tokens_invalid");
  }

  if (options.topP != null && (options.topP < 0 || options.topP > 1)) {
    issues.push("execution_options_top_p_out_of_range");
  }

  if (options.timeoutMs != null && options.timeoutMs <= 0) {
    issues.push("execution_options_timeout_invalid");
  }

  if (options.retryLimit != null && options.retryLimit < 0) {
    issues.push("execution_options_retry_limit_invalid");
  }

  return issues;
}
