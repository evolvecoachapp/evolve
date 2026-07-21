/** Author role for a conversation turn. */
export type MessageRole = "system" | "user" | "assistant";

export const MESSAGE_ROLES: readonly MessageRole[] = Object.freeze([
  "system",
  "user",
  "assistant",
]);
