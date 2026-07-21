/** Delivery / processing state of a conversation message. */
export type MessageStatus = "pending" | "sent" | "failed";

export const MESSAGE_STATUSES: readonly MessageStatus[] = Object.freeze([
  "pending",
  "sent",
  "failed",
]);
