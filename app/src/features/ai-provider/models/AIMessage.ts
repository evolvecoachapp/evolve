/**
 * Immutable chat message in a provider-agnostic request / response.
 */
export type AIMessageRole = "system" | "user" | "assistant" | "tool";

export interface AIMessage {
  readonly id: string;
  readonly role: AIMessageRole;
  readonly content: string;
  readonly name: string | null;
  readonly toolCallId: string | null;
  readonly createdAt: string;
}
