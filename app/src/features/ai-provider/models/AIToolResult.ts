/**
 * Immutable tool-call result returned to a provider conversation.
 */
export interface AIToolResult {
  readonly toolCallId: string;
  readonly name: string;
  readonly content: string;
  readonly isError: boolean;
  readonly createdAt: string;
}
