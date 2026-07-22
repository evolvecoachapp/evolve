/**
 * Structured conversation facts for composition.
 * Derived from ConversationContext — not generated dialogue.
 */
export interface PromptConversation {
  readonly id: string;
  readonly conversationContextId: string;
  readonly goalIds: readonly string[];
  readonly turnIds: readonly string[];
  readonly messageIds: readonly string[];
  readonly requestId: string | null;
  readonly primaryIntent: string | null;
  readonly statement: string;
}
