import type { Conversation } from "../models/Conversation";
import type { ConversationSnapshot } from "../models/ConversationSnapshot";

/**
 * Approximate serialized size in UTF-16 code units (JS string length).
 *
 * Used for persistence budgeting — not a byte-perfect encoder.
 */
export function calculateConversationSize(
  value: Conversation | ConversationSnapshot,
): number {
  return JSON.stringify(value).length;
}
