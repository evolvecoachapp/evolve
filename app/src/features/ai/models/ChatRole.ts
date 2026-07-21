/** Author role for a chat turn. */
export type ChatRole = "system" | "user" | "assistant";

export const CHAT_ROLES: readonly ChatRole[] = Object.freeze([
  "system",
  "user",
  "assistant",
]);
