/**
 * Structured user-input composition slot.
 * References ConversationRequest / goals — not free-form LLM text.
 */
export interface PromptUserInput {
  readonly id: string;
  readonly conversationContextId: string;
  readonly requestId: string | null;
  readonly goalIds: readonly string[];
  readonly primaryIntent: string | null;
  readonly statement: string;
}
