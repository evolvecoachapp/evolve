/**
 * Immutable OpenAI chat message (provider-layer only).
 */
export type OpenAIMessageRole = "system" | "user" | "assistant";

export interface OpenAIMessage {
  readonly role: OpenAIMessageRole;
  readonly content: string;
}
