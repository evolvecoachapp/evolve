import type { ChatRole } from "./ChatRole";

/** One turn in an AI conversation. */
export interface ChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  /** ISO-8601 timestamp. */
  readonly createdAt: string;
}
