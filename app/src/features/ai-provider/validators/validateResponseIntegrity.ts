import type { AIResponse } from "../models/AIResponse";
import { validateProviderId } from "./validateProviderId";

/**
 * Soft-validate standardized AIResponse integrity.
 */
export function validateResponseIntegrity(
  response: AIResponse | null | undefined,
): readonly string[] {
  const issues: string[] = [];
  if (!response) {
    issues.push("response_missing");
    return Object.freeze(issues);
  }

  if (!response.id?.trim()) {
    issues.push("response_id_missing");
  }
  if (!response.requestId?.trim()) {
    issues.push("response_request_id_missing");
  }
  issues.push(
    ...validateProviderId(response.providerId).map(
      (issue) => `response_${issue}`,
    ),
  );
  if (typeof response.content !== "string") {
    issues.push("response_content_invalid");
  }
  if (!response.finishReason) {
    issues.push("response_finish_reason_missing");
  }
  if (!response.usage) {
    issues.push("response_usage_missing");
  } else {
    if (response.usage.promptTokens < 0) {
      issues.push("response_prompt_tokens_invalid");
    }
    if (response.usage.completionTokens < 0) {
      issues.push("response_completion_tokens_invalid");
    }
    if (
      response.usage.totalTokens <
      response.usage.promptTokens + response.usage.completionTokens
    ) {
      issues.push("response_total_tokens_inconsistent");
    }
  }
  if (!response.createdAt?.trim()) {
    issues.push("response_created_at_missing");
  }

  return Object.freeze(issues);
}
