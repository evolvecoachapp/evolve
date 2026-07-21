/** Durable stream lifecycle captured on a conversation snapshot. */
export type ConversationStreamStatus =
  | "idle"
  | "starting"
  | "streaming"
  | "completed"
  | "cancelled"
  | "failed";

export const CONVERSATION_STREAM_STATUSES: readonly ConversationStreamStatus[] =
  Object.freeze([
    "idle",
    "starting",
    "streaming",
    "completed",
    "cancelled",
    "failed",
  ]);
