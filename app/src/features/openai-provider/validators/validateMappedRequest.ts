import type { OpenAIRequest } from "../models/OpenAIRequest";

/**
 * Validate integrity of a mapped OpenAIRequest.
 */
export function validateMappedRequest(
  request: OpenAIRequest | null | undefined,
  streamingEnabled = false,
): readonly string[] {
  const issues: string[] = [];

  if (!request) {
    issues.push("openai_mapped_request_missing");
    return issues;
  }

  if (!request.model || request.model.trim().length === 0) {
    issues.push("openai_mapped_request_model_missing");
  }

  if (!request.messages || request.messages.length === 0) {
    issues.push("openai_mapped_request_messages_empty");
  } else {
    const hasUser = request.messages.some(
      (message) => message.role === "user" && message.content.trim().length > 0,
    );
    if (!hasUser) {
      issues.push("openai_mapped_request_user_message_missing");
    }

    for (const [index, message] of request.messages.entries()) {
      if (!message.content || message.content.trim().length === 0) {
        issues.push(`openai_mapped_request_message_${index}_empty`);
      }
    }
  }

  if (request.stream && !streamingEnabled) {
    issues.push("openai_mapped_request_streaming_not_allowed");
  }

  if (request.temperature != null && (request.temperature < 0 || request.temperature > 2)) {
    issues.push("openai_mapped_request_temperature_out_of_range");
  }

  if (request.maxTokens != null && request.maxTokens <= 0) {
    issues.push("openai_mapped_request_max_tokens_invalid");
  }

  return issues;
}
