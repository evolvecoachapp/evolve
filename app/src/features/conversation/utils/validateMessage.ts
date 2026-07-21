import { MESSAGE_ROLES } from "../models/MessageRole";
import { MESSAGE_STATUSES } from "../models/MessageStatus";
import type { ConversationMessage } from "../models/ConversationMessage";

/** Structured validation issue codes — never prose. */
export type MessageValidationCode =
  | "invalid_id"
  | "invalid_conversation_id"
  | "invalid_role"
  | "invalid_content"
  | "invalid_status"
  | "invalid_timestamps";

/**
 * Validate structural integrity of a ConversationMessage.
 *
 * Returns frozen issue codes; an empty array means the message is valid.
 */
export function validateMessage(
  message: ConversationMessage,
): readonly MessageValidationCode[] {
  const issues: MessageValidationCode[] = [];

  if (!message.id) {
    issues.push("invalid_id");
  }

  if (!message.conversationId) {
    issues.push("invalid_conversation_id");
  }

  if (!(MESSAGE_ROLES as readonly string[]).includes(message.role)) {
    issues.push("invalid_role");
  }

  // Pending messages may be empty while a stream is in progress.
  if (
    typeof message.content !== "string" ||
    (message.status !== "pending" && message.content.trim().length === 0)
  ) {
    issues.push("invalid_content");
  }

  if (!(MESSAGE_STATUSES as readonly string[]).includes(message.status)) {
    issues.push("invalid_status");
  }

  if (!message.createdAt || !message.updatedAt) {
    issues.push("invalid_timestamps");
  }

  return Object.freeze(issues);
}
