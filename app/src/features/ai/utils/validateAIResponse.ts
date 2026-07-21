import { AI_PROVIDER_TYPES } from "../models/AIProviderType";
import { CHAT_ROLES } from "../models/ChatRole";
import type { AIResponse } from "../models/AIResponse";

/** Structured validation issue codes — never prose. */
export type AIResponseValidationCode =
  | "invalid_message_role"
  | "invalid_message_content"
  | "invalid_message_id"
  | "invalid_message_timestamp"
  | "invalid_provider"
  | "provider_model_mismatch"
  | "invalid_token_usage"
  | "missing_generated_at"
  | "missing_model_id"
  | "missing_finish_reason";

function isChatRole(value: string): boolean {
  return (CHAT_ROLES as readonly string[]).includes(value);
}

function isProviderType(value: string): boolean {
  return (AI_PROVIDER_TYPES as readonly string[]).includes(value);
}

/**
 * Validate structural integrity of an AIResponse.
 *
 * Returns frozen issue codes; an empty array means the response is valid.
 */
export function validateAIResponse(
  response: AIResponse,
): readonly AIResponseValidationCode[] {
  const issues: AIResponseValidationCode[] = [];

  if (!response.message.id) {
    issues.push("invalid_message_id");
  }

  if (!isChatRole(response.message.role) || response.message.role !== "assistant") {
    issues.push("invalid_message_role");
  }

  if (
    typeof response.message.content !== "string" ||
    response.message.content.length === 0
  ) {
    issues.push("invalid_message_content");
  }

  if (!response.message.createdAt) {
    issues.push("invalid_message_timestamp");
  }

  if (!isProviderType(response.provider)) {
    issues.push("invalid_provider");
  }

  if (response.model.provider !== response.provider) {
    issues.push("provider_model_mismatch");
  }

  if (!response.model.id || !response.model.name) {
    issues.push("missing_model_id");
  }

  if (
    response.usage.promptTokens < 0 ||
    response.usage.completionTokens < 0 ||
    response.usage.totalTokens < 0 ||
    response.usage.totalTokens !==
      response.usage.promptTokens + response.usage.completionTokens
  ) {
    issues.push("invalid_token_usage");
  }

  if (!response.generatedAt) {
    issues.push("missing_generated_at");
  }

  if (!response.finishReason) {
    issues.push("missing_finish_reason");
  }

  return Object.freeze(issues);
}
