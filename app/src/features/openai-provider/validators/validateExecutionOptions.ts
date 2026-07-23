import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";

/**
 * Validate execution options for OpenAI (no streaming in this sprint).
 */
export function validateOpenAIExecutionOptions(
  options: AIExecutionOptions | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!options) {
    return issues;
  }

  if (
    options.temperature != null &&
    (options.temperature < 0 || options.temperature > 2)
  ) {
    issues.push("openai_execution_options_temperature_out_of_range");
  }

  if (options.maxOutputTokens != null && options.maxOutputTokens <= 0) {
    issues.push("openai_execution_options_max_output_tokens_invalid");
  }

  if (options.topP != null && (options.topP < 0 || options.topP > 1)) {
    issues.push("openai_execution_options_top_p_out_of_range");
  }

  if (options.timeoutMs != null && options.timeoutMs <= 0) {
    issues.push("openai_execution_options_timeout_invalid");
  }

  if (options.stream) {
    issues.push("openai_execution_options_streaming_not_supported");
  }

  return issues;
}
