import { CHAT_ROLES } from "../models/ChatRole";
import type { AIRequest } from "../models/AIRequest";

/** Structured validation issue codes — never prose. */
export type AIRequestValidationCode =
  | "empty_messages"
  | "invalid_message_id"
  | "invalid_message_role"
  | "invalid_message_content"
  | "invalid_message_timestamp"
  | "invalid_consistency_score"
  | "invalid_schema_version"
  | "negative_counts"
  | "conversation_id_mismatch"
  | "empty_section_ids";

function isChatRole(value: string): boolean {
  return (CHAT_ROLES as readonly string[]).includes(value);
}

/**
 * Validate structural integrity of an AIRequest.
 *
 * Returns frozen issue codes; an empty array means the request is valid.
 */
export function validateAIRequest(
  request: AIRequest,
): readonly AIRequestValidationCode[] {
  const issues: AIRequestValidationCode[] = [];

  if (request.messages.length === 0) {
    issues.push("empty_messages");
  }

  for (const message of request.messages) {
    if (!message.id) {
      issues.push("invalid_message_id");
      break;
    }
  }

  for (const message of request.messages) {
    if (!isChatRole(message.role)) {
      issues.push("invalid_message_role");
      break;
    }
  }

  for (const message of request.messages) {
    if (typeof message.content !== "string" || message.content.length === 0) {
      issues.push("invalid_message_content");
      break;
    }
  }

  for (const message of request.messages) {
    if (!message.createdAt) {
      issues.push("invalid_message_timestamp");
      break;
    }
  }

  if (request.consistencyScore < 0 || request.consistencyScore > 1) {
    issues.push("invalid_consistency_score");
  }

  if (request.schemaVersion < 1) {
    issues.push("invalid_schema_version");
  }

  if (
    request.insightCount < 0 ||
    request.riskCount < 0 ||
    request.recommendationCount < 0
  ) {
    issues.push("negative_counts");
  }

  if (request.sectionIds.length === 0) {
    issues.push("empty_section_ids");
  }

  if (
    request.conversation &&
    request.conversation.conversationId.length === 0
  ) {
    issues.push("conversation_id_mismatch");
  }

  return Object.freeze(issues);
}
