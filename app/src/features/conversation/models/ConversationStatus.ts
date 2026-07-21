/** Lifecycle state of a conversation aggregate. */
export type ConversationStatus = "active" | "closed" | "error";

export const CONVERSATION_STATUSES: readonly ConversationStatus[] =
  Object.freeze(["active", "closed", "error"]);
