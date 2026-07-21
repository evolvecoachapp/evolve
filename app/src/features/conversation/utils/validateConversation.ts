import { CONVERSATION_STATUSES } from "../models/ConversationStatus";
import type { Conversation } from "../models/Conversation";
import { validateMessage } from "./validateMessage";

/** Structured validation issue codes — never prose. */
export type ConversationValidationCode =
  | "invalid_id"
  | "invalid_status"
  | "invalid_timestamps"
  | "invalid_metadata"
  | "invalid_session"
  | "message_conversation_mismatch"
  | "invalid_message"
  | "unsorted_messages";

/**
 * Validate structural integrity of a Conversation aggregate.
 *
 * Returns frozen issue codes; an empty array means the conversation is valid.
 */
export function validateConversation(
  conversation: Conversation,
): readonly ConversationValidationCode[] {
  const issues: ConversationValidationCode[] = [];

  if (!conversation.id) {
    issues.push("invalid_id");
  }

  if (
    !(CONVERSATION_STATUSES as readonly string[]).includes(conversation.status)
  ) {
    issues.push("invalid_status");
  }

  if (!conversation.createdAt || !conversation.updatedAt) {
    issues.push("invalid_timestamps");
  }

  if (
    !conversation.metadata ||
    typeof conversation.metadata.title !== "string" ||
    conversation.metadata.messageCount !== conversation.messages.length ||
    conversation.metadata.createdAt !== conversation.createdAt
  ) {
    issues.push("invalid_metadata");
  }

  if (
    !conversation.session ||
    conversation.session.conversationId !== conversation.id ||
    !conversation.session.id ||
    !conversation.session.startedAt
  ) {
    issues.push("invalid_session");
  }

  for (const message of conversation.messages) {
    if (message.conversationId !== conversation.id) {
      issues.push("message_conversation_mismatch");
      break;
    }
  }

  for (const message of conversation.messages) {
    if (validateMessage(message).length > 0) {
      issues.push("invalid_message");
      break;
    }
  }

  const ordered = [...conversation.messages].sort((left, right) => {
    const byTime = left.createdAt.localeCompare(right.createdAt);
    if (byTime !== 0) {
      return byTime;
    }
    return left.id.localeCompare(right.id);
  });

  const isSorted = conversation.messages.every(
    (message, index) => message.id === ordered[index]?.id,
  );
  if (!isSorted) {
    issues.push("unsorted_messages");
  }

  return Object.freeze(issues);
}
