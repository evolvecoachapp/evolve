import { CONVERSATION_STATUSES } from "../models/ConversationStatus";
import { CONVERSATION_STREAM_STATUSES } from "../models/ConversationStreamStatus";
import type { ConversationSnapshot } from "../models/ConversationSnapshot";
import { isSupportedConversationPersistenceVersion } from "../models/ConversationPersistenceVersion";
import { validateMessage } from "./validateMessage";

/** Structured validation issue codes for durable snapshots. */
export type ConversationSnapshotValidationCode =
  | "invalid_id"
  | "invalid_status"
  | "invalid_stream_status"
  | "invalid_timestamps"
  | "invalid_metadata"
  | "invalid_session"
  | "invalid_schema_version"
  | "invalid_message"
  | "message_conversation_mismatch";

/**
 * Validate structural integrity of a ConversationSnapshot.
 *
 * Returns frozen issue codes; an empty array means the snapshot is valid.
 */
export function validateConversationSnapshot(
  snapshot: ConversationSnapshot,
): readonly ConversationSnapshotValidationCode[] {
  const issues: ConversationSnapshotValidationCode[] = [];

  if (!snapshot.id) {
    issues.push("invalid_id");
  }

  if (!(CONVERSATION_STATUSES as readonly string[]).includes(snapshot.status)) {
    issues.push("invalid_status");
  }

  if (
    !(CONVERSATION_STREAM_STATUSES as readonly string[]).includes(
      snapshot.streamStatus,
    )
  ) {
    issues.push("invalid_stream_status");
  }

  if (!snapshot.createdAt || !snapshot.updatedAt) {
    issues.push("invalid_timestamps");
  }

  if (
    !snapshot.metadata ||
    typeof snapshot.metadata.title !== "string" ||
    snapshot.metadata.messageCount !== snapshot.messages.length ||
    snapshot.metadata.createdAt !== snapshot.createdAt
  ) {
    issues.push("invalid_metadata");
  }

  if (
    !snapshot.session ||
    snapshot.session.conversationId !== snapshot.id ||
    !snapshot.session.id ||
    !snapshot.session.startedAt
  ) {
    issues.push("invalid_session");
  }

  if (!isSupportedConversationPersistenceVersion(snapshot.schemaVersion)) {
    issues.push("invalid_schema_version");
  }

  for (const message of snapshot.messages) {
    if (message.conversationId !== snapshot.id) {
      issues.push("message_conversation_mismatch");
      break;
    }
  }

  for (const message of snapshot.messages) {
    if (validateMessage(message).length > 0) {
      issues.push("invalid_message");
      break;
    }
  }

  return Object.freeze(issues);
}
