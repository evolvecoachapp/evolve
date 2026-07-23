import type { OpenAIResponse } from "../models/OpenAIResponse";

/**
 * Validate integrity of a provider-layer OpenAIResponse.
 */
export function validateResponse(
  response: OpenAIResponse | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!response) {
    issues.push("openai_response_missing");
    return issues;
  }

  if (!response.id || response.id.trim().length === 0) {
    issues.push("openai_response_id_missing");
  }

  if (!response.choices || response.choices.length === 0) {
    issues.push("openai_response_choices_empty");
  } else {
    const first = response.choices[0];
    if (!first?.message) {
      issues.push("openai_response_message_missing");
    }
  }

  if (response.usage.totalTokens < 0) {
    issues.push("openai_response_usage_invalid");
  }

  return issues;
}
